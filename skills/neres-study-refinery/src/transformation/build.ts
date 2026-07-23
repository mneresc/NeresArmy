import { mkdir, readFile, writeFile } from "node:fs/promises";
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
import { createVisualExtractor, imageMimeType } from "../images/create-extractor.ts";
import { appendVisualEvidence } from "../images/visual-evidence.ts";
import { analyzeMarkdown } from "../markdown/analyze.ts";
import { buildDryRunPlan } from "../planning/dry-run.ts";
import { toVaultRelative } from "../scope/boundary.ts";

function stableJson(value: unknown): string {
  return `${JSON.stringify(value, null, 2)}\n`;
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
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, content, "utf8");
  createdFiles.push(toVaultRelative(vaultRoot, target));
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

    await writeOutputFile(
      target,
      composition.markdown,
      createdFiles,
      plan.scope.vaultRoot
    );
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

  return {
    createdFiles,
    sourceCount: inventory.sources.length,
    noteCount
  };
}
