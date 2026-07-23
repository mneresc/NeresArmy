import { readFile } from "node:fs/promises";
import path from "node:path";
import { classifyDomainProfile } from "../classification/domain-profile.ts";
import { classifySourceState } from "../classification/source-state.ts";
import { composeMarkdown } from "../composition/compose.ts";
import type {
  BuildRequest,
  BuildResult,
  ContentModel,
  InventorySource,
  SourceInventory,
  VisualExtractionResult
} from "../contracts.ts";
import type { RefineryConfig } from "../config.ts";
import { extractContentModel } from "../evidence/extract.ts";
import { buildSourceInventory } from "../inventory/build-inventory.ts";
import { ArchifyAdapter } from "../diagrams/archify-adapter.ts";
import {
  candidateFromVisual,
  candidatesFromContentModel,
  scoreDiagramCandidate
} from "../diagrams/candidates.ts";
import { detectArchifyPath } from "../diagrams/detect-archify.ts";
import type { DiagramCandidate } from "../diagrams/types.ts";
import { createVisualExtractor, imageMimeType } from "../images/create-extractor.ts";
import { appendVisualEvidence } from "../images/visual-evidence.ts";
import { analyzeMarkdown } from "../markdown/analyze.ts";
import { atomicWriteFile } from "../output/atomic-write.ts";
import { addStudyFrontmatter } from "../output/frontmatter.ts";
import {
  renderOverview,
  type OverviewEntry
} from "../output/overview.ts";
import {
  renderTransformationReport,
  type TransformationReportData
} from "../output/report.ts";
import { buildDryRunPlan } from "../planning/dry-run.ts";
import { toVaultRelative } from "../scope/boundary.ts";
import {
  assertOutputValidation,
  validateOutput,
  type OutputValidationResult
} from "../validation/validate-output.ts";

function stableJson(value: unknown): string {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function diagramSection(
  markdown: string,
  candidates: readonly DiagramCandidate[]
): string {
  if (candidates.length === 0) {
    return markdown;
  }
  const blocks = candidates.map((candidate) =>
    [
      `![[assets/${candidate.id}.svg]]`,
      "",
      "> [!info] Versão interativa",
      `> [[assets/${candidate.id}.html|Abrir diagrama interativo]]`
    ].join("\n")
  );
  const section = `## Diagramas\n\n${blocks.join("\n\n")}`;
  if (/^##\s+Rastreabilidade\s*$/imu.test(markdown)) {
    return markdown.replace(
      /\n##\s+Rastreabilidade\s*\n/u,
      `\n\n${section}\n\n## Rastreabilidade\n`
    );
  }
  return `${markdown.trim()}\n\n${section}\n`;
}

function noteTarget(
  scopeInput: string,
  scopeOutput: string,
  sourcePath: string,
  inputType: BuildRequest["inputType"]
): string {
  if (inputType === "note") {
    return scopeOutput;
  }
  const relative = path.relative(scopeInput, sourcePath);
  const extension = path.extname(relative);
  const stem = path.basename(relative, extension);
  return path.join(
    scopeOutput,
    path.dirname(relative),
    `${stem}-V2.md`
  );
}

function auditDirectory(
  outputPath: string,
  targetPath: string,
  sourcePath: string,
  inputType: BuildRequest["inputType"]
): string {
  const stem = path.basename(sourcePath, path.extname(sourcePath));
  if (inputType === "note") {
    return path.join(path.dirname(outputPath), "_audit", stem);
  }
  const targetRelative = path.relative(outputPath, targetPath);
  return path.join(
    outputPath,
    "_audit",
    path.dirname(targetRelative),
    stem
  );
}

function inventorySource(
  inventory: SourceInventory,
  sourcePath: string
): InventorySource {
  const source = inventory.sources.find((candidate) => candidate.path === sourcePath);
  if (!source?.markdown) {
    throw new Error(`Inventory source is missing Markdown analysis: ${sourcePath}`);
  }
  return source;
}

async function writeOutputFile(
  target: string,
  content: string,
  createdFiles: string[],
  vaultRoot: string
): Promise<void> {
  await atomicWriteFile(target, content);
  createdFiles.push(toVaultRelative(vaultRoot, target));
}

function unique(values: readonly string[]): string[] {
  return values.filter((value, index) => values.indexOf(value) === index);
}

function isImageOnlyMarkdown(markdown: string): boolean {
  return markdown
    .replace(/^---[\s\S]*?^---\s*$/mu, "")
    .replace(/^#{1,6}\s+.*$/gmu, "")
    .replace(/!\[\[[^\]]+\]\]/gu, "")
    .replace(/!\[[^\]]*\]\([^)]*\)/gu, "")
    .trim().length === 0;
}

function estimateReduction(sourceCharacters: number, outputCharacters: number): string {
  if (sourceCharacters === 0) {
    return "0.0%";
  }
  const percentage = Math.max(
    0,
    (1 - outputCharacters / sourceCharacters) * 100
  );
  return `${percentage.toFixed(1)}%`;
}

export async function buildTransformation(
  request: BuildRequest,
  config: RefineryConfig
): Promise<BuildResult> {
  const plan = await buildDryRunPlan({ ...request, dryRun: true }, config);
  const inventory = await buildSourceInventory(plan.scope, plan.entries);
  const extractor = await createVisualExtractor(request, plan.scope);
  const visualResults = new Map<string, VisualExtractionResult>();
  if (extractor) {
    for (const source of inventory.sources) {
      if (source.type !== "image") {
        continue;
      }
      const entry = plan.entries.find((candidate) => candidate.path === source.path);
      if (!entry) {
        continue;
      }
      const result = await extractor.extract({
        sourceId: source.id,
        sourcePath: source.path,
        absolutePath: entry.absolutePath,
        sha256: source.sha256,
        mimeType: imageMimeType(entry.absolutePath)
      });
      source.status = "processed";
      source.classification = result.classification;
      source.confidence = result.confidence;
      visualResults.set(source.path, result);
    }
  }
  const createdFiles: string[] = [];
  const warnings: string[] = [];
  const profiles = new Set<ContentModel["profile"]>();
  const overviewEntries: OverviewEntry[] = [];
  const validations: OutputValidationResult[] = [];
  let rawNotes = 0;
  let structuredNotes = 0;
  let imageOnlyNotes = 0;
  let tablesFound = 0;
  let formulasFound = 0;
  let codeFound = 0;
  let diagramsFound = 0;
  let claimCount = 0;
  let diagramsGenerated = 0;
  let sourceCharacters = 0;
  let outputCharacters = 0;
  let archifyAdapter: ArchifyAdapter | undefined;
  let archifyChecked = false;

  async function adapterForCandidates(): Promise<ArchifyAdapter | undefined> {
    if (archifyChecked) {
      return archifyAdapter;
    }
    archifyChecked = true;
    const executablePath = await detectArchifyPath(request.archifyPath);
    if (!executablePath) {
      warnings.push(
        "Archify was not found. Install tt-a1i/archify, run `node bin/archify.mjs doctor`, or set --archify-path."
      );
      return undefined;
    }
    archifyAdapter = new ArchifyAdapter({ executablePath });
    return archifyAdapter;
  }

  let noteCount = 0;

  for (const entry of plan.entries) {
    if (entry.kind !== "markdown") {
      continue;
    }
    const markdown = await readFile(entry.absolutePath, "utf8");
    const source = inventorySource(inventory, entry.path);
    const analysis = source.markdown ?? analyzeMarkdown(markdown);
    const state = classifySourceState(markdown, analysis);
    const profile = classifyDomainProfile(markdown, request.profile);
    profiles.add(profile.profile);
    sourceCharacters += markdown.length;
    if (state.state === "raw") rawNotes += 1;
    else structuredNotes += 1;
    if (isImageOnlyMarkdown(markdown)) imageOnlyNotes += 1;
    tablesFound += analysis.tables.length;
    formulasFound += analysis.formulas.length;
    codeFound += analysis.codeBlocks.length;
    const model: ContentModel = extractContentModel(
      { id: source.id, path: source.path, markdown: analysis },
      markdown,
      profile.profile
    );
    const relevantVisualResults = inventory.sources
      .filter(
        (candidate) =>
          candidate.type === "image" &&
          candidate.referencedBy?.includes(source.path)
      )
      .map((candidate) => visualResults.get(candidate.path))
      .filter((result): result is VisualExtractionResult => result !== undefined);
    for (const result of relevantVisualResults) {
      appendVisualEvidence(model, result, config.images.minimum_confidence);
    }
    claimCount += model.claims.length;
    const composition = composeMarkdown({
      sourcePath: source.path,
      markdown,
      analysis,
      state: state.state,
      profile: profile.profile,
      model
    });
    const target = noteTarget(
      plan.scope.inputPath,
      plan.scope.outputPath,
      entry.absolutePath,
      plan.scope.inputType
    );
    const audit = auditDirectory(
      plan.scope.outputPath,
      target,
      entry.absolutePath,
      plan.scope.inputType
    );
    const candidates =
      request.diagrams === "off"
        ? []
        : [
            ...relevantVisualResults
              .map((result) => candidateFromVisual(result, model.topic))
              .filter((candidate): candidate is DiagramCandidate => candidate !== undefined),
            ...candidatesFromContentModel(model, source.path)
          ].filter(
            (candidate) =>
              candidate.confidence >= config.images.minimum_confidence &&
              scoreDiagramCandidate(candidate) >= config.diagrams.minimum_score
          );
    const renderedCandidates: DiagramCandidate[] = [];
    if (candidates.length > 0) {
      const adapter = await adapterForCandidates();
      if (adapter) {
        const assetsDirectory = path.join(path.dirname(target), "assets");
        for (const candidate of candidates) {
          const result = await adapter.render(candidate, assetsDirectory);
          for (const artifact of [
            result.inputPath,
            result.htmlPath,
            result.svgPath
          ]) {
            createdFiles.push(toVaultRelative(plan.scope.vaultRoot, artifact));
          }
          renderedCandidates.push(candidate);
          diagramsGenerated += 1;
        }
      }
    }

    diagramsFound += candidates.length;
    const body = diagramSection(composition.markdown, renderedCandidates);
    const registeredSourcePaths = new Set(
      inventory.sources.map((candidate) => candidate.path)
    );
    const sourceCorpus = [
      markdown,
      ...relevantVisualResults
        .map((result) =>
          model.claims
            .filter(
              (claim) =>
                claim.sourcePath === result.sourcePath &&
                claim.status === "supported"
            )
            .map((claim) => claim.sourceExcerpt)
            .join("\n")
        )
    ].join("\n\n");
    const validation = validateOutput({
      sourceCorpus,
      markdown: body,
      model,
      registeredSourcePaths,
      config: config.validation
    });
    assertOutputValidation(validation);
    validations.push(validation);
    const sourceNotes = unique(
      model.claims
        .filter((claim) =>
          inventory.sources.some(
            (candidate) =>
              candidate.type === "markdown" &&
              candidate.path === claim.sourcePath
          )
        )
        .map((claim) => claim.sourcePath)
    );
    const sourceImages = unique(
      model.claims
        .filter((claim) =>
          inventory.sources.some(
            (candidate) =>
              candidate.type === "image" &&
              candidate.path === claim.sourcePath
          )
        )
        .map((claim) => claim.sourcePath)
    );
    const finalMarkdown = addStudyFrontmatter({
      markdown: body,
      profile: profile.profile,
      sourceScope: plan.scope.inputType === "note"
        ? source.path
        : toVaultRelative(plan.scope.vaultRoot, plan.scope.inputPath),
      sourceNotes,
      sourceImages,
      compression: request.compression,
      diagramCount: renderedCandidates.length
    });
    outputCharacters += finalMarkdown.length;
    await writeOutputFile(
      target,
      finalMarkdown,
      createdFiles,
      plan.scope.vaultRoot
    );
    overviewEntries.push({ targetPath: target, title: model.topic });
    await writeOutputFile(
      path.join(audit, "source-inventory.json"),
      stableJson(inventory),
      createdFiles,
      plan.scope.vaultRoot
    );
    await writeOutputFile(
      path.join(audit, "content-model.json"),
      stableJson(model),
      createdFiles,
      plan.scope.vaultRoot
    );
    await writeOutputFile(
      path.join(audit, "classification.json"),
      stableJson({ sourceState: state, domainProfile: profile }),
      createdFiles,
      plan.scope.vaultRoot
    );
    if (relevantVisualResults.length > 0) {
      await writeOutputFile(
        path.join(audit, "visual-evidence.json"),
        stableJson(relevantVisualResults),
        createdFiles,
        plan.scope.vaultRoot
      );
    }
    noteCount += 1;
  }

  if (
    plan.scope.inputType === "folder" &&
    config.output.create_overview
  ) {
    await writeOutputFile(
      path.join(plan.scope.outputPath, "_Visão Geral.md"),
      renderOverview(plan.scope.outputPath, overviewEntries),
      createdFiles,
      plan.scope.vaultRoot
    );
  }

  if (config.output.create_audit_report) {
    const reportRoot =
      plan.scope.inputType === "note"
        ? path.dirname(plan.scope.outputPath)
        : plan.scope.outputPath;
    const inputName = path.basename(
      plan.scope.inputPath,
      path.extname(plan.scope.inputPath)
    );
    const visualValues = [...visualResults.values()];
    const reportData: TransformationReportData = {
      input: toVaultRelative(plan.scope.vaultRoot, plan.scope.inputPath),
      inputType: plan.scope.inputType,
      profiles: [...profiles],
      markdownFiles: inventory.sources.filter((source) => source.type === "markdown").length,
      images: inventory.sources.filter((source) => source.type === "image").length,
      ignoredFiles: plan.rejectedEntries.length,
      ignoredExternalLinks: inventory.sources
        .filter((source) => source.markdown)
        .reduce(
          (total, source) =>
            total +
            (source.markdown?.links.filter((link) => /^https?:\/\//iu.test(link))
              .length ?? 0),
          0
        ),
      rawNotes,
      structuredNotes,
      imageOnlyNotes,
      tablesFound,
      formulasFound,
      codeFound,
      diagramsFound,
      claims: claimCount,
      transcribedPassages: visualValues.filter((result) => result.transcription).length,
      reconstructedTables: visualValues.filter((result) => result.markdownTable).length,
      transcribedFormulas: visualValues.filter((result) => result.latex).length,
      interpretedDiagrams: visualValues.filter((result) => result.diagram).length,
      illegiblePassages: visualValues.filter(
        (result) => result.status === "illegible"
      ).length,
      notesV2: noteCount,
      diagramsGenerated,
      tablesCreated:
        tablesFound +
        visualValues.filter((result) => result.markdownTable).length,
      estimatedReduction: estimateReduction(sourceCharacters, outputCharacters),
      redundanciesRemoved: 0,
      structuresPreserved: tablesFound + formulasFound + codeFound,
      validations
    };
    await writeOutputFile(
      path.join(
        reportRoot,
        "_audit",
        `${inputName}-transformation-report.md`
      ),
      renderTransformationReport(reportData),
      createdFiles,
      plan.scope.vaultRoot
    );
  }

  return {
    createdFiles,
    sourceCount: inventory.sources.length,
    noteCount,
    warnings
  };
}
