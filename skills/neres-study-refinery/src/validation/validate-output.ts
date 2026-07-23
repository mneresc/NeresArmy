import type { RefineryConfig } from "../config.ts";
import type { ContentModel } from "../contracts.ts";
import { RefineryError } from "../errors.ts";
import {
  compareCodeEvidence,
  compareEntityEvidence,
  compareFormulaEvidence,
  compareModalityEvidence,
  compareNumberEvidence,
  validateGrounding
} from "./evidence.ts";

export interface OutputValidationResult {
  grounding: string[];
  numbers: string[];
  entities: string[];
  modality: string[];
  formulas: string[];
  code: string[];
  externalSources: string[];
  passed: boolean;
}

export function validateOutput(options: {
  sourceCorpus: string;
  markdown: string;
  model: ContentModel;
  registeredSourcePaths: ReadonlySet<string>;
  config: RefineryConfig["validation"];
}): OutputValidationResult {
  const factualOutput = options.model.claims
    .filter((claim) => claim.status === "supported")
    .map((claim) => claim.sourceExcerpt)
    .join("\n\n");
  const grounding = options.config.require_grounding
    ? validateGrounding(
        options.model,
        options.markdown,
        options.registeredSourcePaths
      )
    : [];
  const unsupported = options.config.fail_on_unsupported_claim
    ? options.model.claims
        .filter(
          (claim) =>
            claim.status !== "supported" &&
            options.markdown.includes(`<!-- claimId: ${claim.id} -->`)
        )
        .map((claim) => `${claim.id}:unsupported`)
    : [];
  grounding.push(...unsupported);
  const externalSources = options.config.fail_on_external_source
    ? options.model.claims
        .filter((claim) => !options.registeredSourcePaths.has(claim.sourcePath))
        .map((claim) => claim.sourcePath)
    : [];
  const result: OutputValidationResult = {
    grounding,
    numbers: options.config.verify_numbers
      ? compareNumberEvidence(options.sourceCorpus, factualOutput)
      : [],
    entities: options.config.verify_entities
      ? compareEntityEvidence(options.sourceCorpus, factualOutput)
      : [],
    modality: options.config.verify_modality
      ? compareModalityEvidence(options.sourceCorpus, factualOutput)
      : [],
    formulas: options.config.verify_formulas
      ? compareFormulaEvidence(options.sourceCorpus, factualOutput)
      : [],
    code: options.config.verify_code
      ? compareCodeEvidence(options.sourceCorpus, factualOutput)
      : [],
    externalSources,
    passed: false
  };
  result.passed = Object.entries(result).every(
    ([key, value]) => key === "passed" || (value as string[]).length === 0
  );
  return result;
}

export function assertOutputValidation(result: OutputValidationResult): void {
  if (result.passed) {
    return;
  }
  const summary = Object.entries(result)
    .filter(
      ([key, value]) =>
        key !== "passed" && Array.isArray(value) && value.length > 0
    )
    .map(([key, value]) => `${key}=${(value as string[]).join(",")}`)
    .join("; ");
  throw new RefineryError(
    "ERR_VALIDATION",
    `Output evidence validation failed: ${summary}.`
  );
}

