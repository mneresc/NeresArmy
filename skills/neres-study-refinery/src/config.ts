import { readFile } from "node:fs/promises";
import path from "node:path";
import { parseDocument } from "yaml";
import {
  COMPRESSION_MODES,
  DIAGRAM_MODES,
  PROFILES,
  type CompressionMode,
  type DiagramMode,
  type Profile
} from "./contracts.ts";
import { RefineryError } from "./errors.ts";

export interface RefineryConfig {
  input: {
    include_subfolders: boolean;
  };
  scope: {
    follow_internal_links: boolean;
    allow_external_notes: boolean;
    allow_web: boolean;
    allow_model_knowledge: boolean;
    process_embedded_images: boolean;
    process_folder_images: boolean;
    excluded_directories: string[];
  };
  classification: {
    profile: Profile;
    detect_per_section: boolean;
    preserve_structured_notes: boolean;
  };
  output: {
    mode: "separate-folder";
    overwrite_originals: boolean;
    create_overview: boolean;
    create_audit_report: boolean;
    preserve_wikilinks: boolean;
    remove_empty_sections: boolean;
    preserve_numeric_order: boolean;
  };
  transformation: {
    compression: CompressionMode;
    preserve_examples: boolean;
    preserve_counterexamples: boolean;
    preserve_exam_traps: boolean;
    preserve_edge_cases: boolean;
    preserve_questions: boolean;
    preserve_normative_language: boolean;
    preserve_code: boolean;
    preserve_formulas: boolean;
    create_review_questions: boolean;
  };
  images: {
    transcribe_text: boolean;
    reconstruct_tables: boolean;
    reconstruct_formulas: boolean;
    reconstruct_diagrams: boolean;
    ignore_decorative: boolean;
    mark_uncertainty: boolean;
    minimum_confidence: number;
  };
  diagrams: {
    mode: DiagramMode;
    provider: "archify";
    minimum_score: number;
    output_svg: boolean;
    output_html: boolean;
    output_png: boolean;
  };
  validation: {
    require_grounding: boolean;
    verify_numbers: boolean;
    verify_entities: boolean;
    verify_modality: boolean;
    verify_formulas: boolean;
    verify_code: boolean;
    verify_diagram_topology: boolean;
    fail_on_external_source: boolean;
    fail_on_unsupported_claim: boolean;
    fail_on_original_overwrite: boolean;
  };
}

const defaultConfigPath = path.resolve(
  import.meta.dirname,
  "../config/default-config.yaml"
);

const ALLOWED_KEYS = {
  root: [
    "input",
    "scope",
    "classification",
    "output",
    "transformation",
    "images",
    "diagrams",
    "validation"
  ],
  input: ["include_subfolders"],
  scope: [
    "follow_internal_links",
    "allow_external_notes",
    "allow_web",
    "allow_model_knowledge",
    "process_embedded_images",
    "process_folder_images",
    "excluded_directories"
  ],
  classification: [
    "profile",
    "detect_per_section",
    "preserve_structured_notes"
  ],
  output: [
    "mode",
    "overwrite_originals",
    "create_overview",
    "create_audit_report",
    "preserve_wikilinks",
    "remove_empty_sections",
    "preserve_numeric_order"
  ],
  transformation: [
    "compression",
    "preserve_examples",
    "preserve_counterexamples",
    "preserve_exam_traps",
    "preserve_edge_cases",
    "preserve_questions",
    "preserve_normative_language",
    "preserve_code",
    "preserve_formulas",
    "create_review_questions"
  ],
  images: [
    "transcribe_text",
    "reconstruct_tables",
    "reconstruct_formulas",
    "reconstruct_diagrams",
    "ignore_decorative",
    "mark_uncertainty",
    "minimum_confidence"
  ],
  diagrams: [
    "mode",
    "provider",
    "minimum_score",
    "output_svg",
    "output_html",
    "output_png"
  ],
  validation: [
    "require_grounding",
    "verify_numbers",
    "verify_entities",
    "verify_modality",
    "verify_formulas",
    "verify_code",
    "verify_diagram_topology",
    "fail_on_external_source",
    "fail_on_unsupported_claim",
    "fail_on_original_overwrite"
  ]
} as const;

type SectionName = Exclude<keyof typeof ALLOWED_KEYS, "root">;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function requireRecord(value: unknown, key: string): Record<string, unknown> {
  if (!isRecord(value)) {
    throw new RefineryError("ERR_CONFIG", `Configuration section '${key}' is invalid.`);
  }
  return value;
}

function rejectUnknownKeys(
  record: Record<string, unknown>,
  section: keyof typeof ALLOWED_KEYS
): void {
  const allowed = new Set<string>(ALLOWED_KEYS[section]);
  const unknown = Object.keys(record).find((key) => !allowed.has(key));
  if (unknown) {
    throw new RefineryError(
      "ERR_CONFIG",
      `Unknown configuration key '${section}.${unknown}'.`
    );
  }
}

function parseYaml(source: string, sourceLabel: string): Record<string, unknown> {
  const document = parseDocument(source, {
    schema: "core",
    uniqueKeys: true,
    customTags: []
  });
  if (document.errors.length > 0) {
    throw new RefineryError(
      "ERR_CONFIG",
      `Configuration '${sourceLabel}' is invalid: ${
        document.errors[0]?.message ?? "parse error"
      }.`
    );
  }
  if (document.warnings.length > 0) {
    throw new RefineryError(
      "ERR_CONFIG",
      `Configuration '${sourceLabel}' has warnings: ${
        document.warnings[0]?.message ?? "warning"
      }.`
    );
  }
  const root = requireRecord(document.toJS(), "root");
  rejectUnknownKeys(root, "root");
  for (const [key, value] of Object.entries(root)) {
    const section = key as SectionName;
    const record = requireRecord(value, section);
    rejectUnknownKeys(record, section);
  }
  return root;
}

function mergeConfiguration(
  base: Record<string, unknown>,
  override: Record<string, unknown>
): Record<string, unknown> {
  const merged: Record<string, unknown> = { ...base };
  for (const [key, value] of Object.entries(override)) {
    const baseValue = base[key];
    merged[key] =
      isRecord(baseValue) && isRecord(value)
        ? { ...baseValue, ...value }
        : value;
  }
  return merged;
}

function requireBoolean(record: Record<string, unknown>, key: string): boolean {
  const value = record[key];
  if (typeof value !== "boolean") {
    throw new RefineryError(
      "ERR_CONFIG",
      `Configuration value '${key}' must be boolean.`
    );
  }
  return value;
}

function requireString(record: Record<string, unknown>, key: string): string {
  const value = record[key];
  if (typeof value !== "string") {
    throw new RefineryError(
      "ERR_CONFIG",
      `Configuration value '${key}' must be a string.`
    );
  }
  return value;
}

function requireNumber(record: Record<string, unknown>, key: string): number {
  const value = record[key];
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new RefineryError(
      "ERR_CONFIG",
      `Configuration value '${key}' must be a number.`
    );
  }
  return value;
}

function requireChoice<T extends string>(
  record: Record<string, unknown>,
  key: string,
  choices: readonly T[]
): T {
  const value = requireString(record, key);
  if (!choices.includes(value as T)) {
    throw new RefineryError(
      "ERR_CONFIG",
      `Configuration value '${key}' must be one of: ${choices.join(", ")}.`
    );
  }
  return value as T;
}

function requireStringArray(
  record: Record<string, unknown>,
  key: string
): string[] {
  const value = record[key];
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) {
    throw new RefineryError(
      "ERR_CONFIG",
      `Configuration value '${key}' must be a string array.`
    );
  }
  return [...value] as string[];
}

function validateConfiguration(root: Record<string, unknown>): RefineryConfig {
  const input = requireRecord(root.input, "input");
  const scope = requireRecord(root.scope, "scope");
  const classification = requireRecord(root.classification, "classification");
  const output = requireRecord(root.output, "output");
  const transformation = requireRecord(root.transformation, "transformation");
  const images = requireRecord(root.images, "images");
  const diagrams = requireRecord(root.diagrams, "diagrams");
  const validation = requireRecord(root.validation, "validation");
  const minimumConfidence = requireNumber(images, "minimum_confidence");
  const minimumScore = requireNumber(diagrams, "minimum_score");
  if (minimumConfidence < 0 || minimumConfidence > 1) {
    throw new RefineryError(
      "ERR_CONFIG",
      "Configuration value 'minimum_confidence' must be between 0 and 1."
    );
  }
  if (minimumScore < 0) {
    throw new RefineryError(
      "ERR_CONFIG",
      "Configuration value 'minimum_score' must be non-negative."
    );
  }
  return {
    input: {
      include_subfolders: requireBoolean(input, "include_subfolders")
    },
    scope: {
      follow_internal_links: requireBoolean(scope, "follow_internal_links"),
      allow_external_notes: requireBoolean(scope, "allow_external_notes"),
      allow_web: requireBoolean(scope, "allow_web"),
      allow_model_knowledge: requireBoolean(scope, "allow_model_knowledge"),
      process_embedded_images: requireBoolean(scope, "process_embedded_images"),
      process_folder_images: requireBoolean(scope, "process_folder_images"),
      excluded_directories: requireStringArray(scope, "excluded_directories")
    },
    classification: {
      profile: requireChoice(classification, "profile", PROFILES),
      detect_per_section: requireBoolean(classification, "detect_per_section"),
      preserve_structured_notes: requireBoolean(
        classification,
        "preserve_structured_notes"
      )
    },
    output: {
      mode: requireChoice(output, "mode", ["separate-folder"] as const),
      overwrite_originals: requireBoolean(output, "overwrite_originals"),
      create_overview: requireBoolean(output, "create_overview"),
      create_audit_report: requireBoolean(output, "create_audit_report"),
      preserve_wikilinks: requireBoolean(output, "preserve_wikilinks"),
      remove_empty_sections: requireBoolean(output, "remove_empty_sections"),
      preserve_numeric_order: requireBoolean(output, "preserve_numeric_order")
    },
    transformation: {
      compression: requireChoice(
        transformation,
        "compression",
        COMPRESSION_MODES
      ),
      preserve_examples: requireBoolean(transformation, "preserve_examples"),
      preserve_counterexamples: requireBoolean(
        transformation,
        "preserve_counterexamples"
      ),
      preserve_exam_traps: requireBoolean(
        transformation,
        "preserve_exam_traps"
      ),
      preserve_edge_cases: requireBoolean(
        transformation,
        "preserve_edge_cases"
      ),
      preserve_questions: requireBoolean(
        transformation,
        "preserve_questions"
      ),
      preserve_normative_language: requireBoolean(
        transformation,
        "preserve_normative_language"
      ),
      preserve_code: requireBoolean(transformation, "preserve_code"),
      preserve_formulas: requireBoolean(transformation, "preserve_formulas"),
      create_review_questions: requireBoolean(
        transformation,
        "create_review_questions"
      )
    },
    images: {
      transcribe_text: requireBoolean(images, "transcribe_text"),
      reconstruct_tables: requireBoolean(images, "reconstruct_tables"),
      reconstruct_formulas: requireBoolean(images, "reconstruct_formulas"),
      reconstruct_diagrams: requireBoolean(images, "reconstruct_diagrams"),
      ignore_decorative: requireBoolean(images, "ignore_decorative"),
      mark_uncertainty: requireBoolean(images, "mark_uncertainty"),
      minimum_confidence: minimumConfidence
    },
    diagrams: {
      mode: requireChoice(diagrams, "mode", DIAGRAM_MODES),
      provider: requireChoice(diagrams, "provider", ["archify"] as const),
      minimum_score: minimumScore,
      output_svg: requireBoolean(diagrams, "output_svg"),
      output_html: requireBoolean(diagrams, "output_html"),
      output_png: requireBoolean(diagrams, "output_png")
    },
    validation: {
      require_grounding: requireBoolean(validation, "require_grounding"),
      verify_numbers: requireBoolean(validation, "verify_numbers"),
      verify_entities: requireBoolean(validation, "verify_entities"),
      verify_modality: requireBoolean(validation, "verify_modality"),
      verify_formulas: requireBoolean(validation, "verify_formulas"),
      verify_code: requireBoolean(validation, "verify_code"),
      verify_diagram_topology: requireBoolean(
        validation,
        "verify_diagram_topology"
      ),
      fail_on_external_source: requireBoolean(
        validation,
        "fail_on_external_source"
      ),
      fail_on_unsupported_claim: requireBoolean(
        validation,
        "fail_on_unsupported_claim"
      ),
      fail_on_original_overwrite: requireBoolean(
        validation,
        "fail_on_original_overwrite"
      )
    }
  };
}

async function readConfiguration(pathname: string): Promise<string> {
  try {
    return await readFile(pathname, "utf8");
  } catch (error) {
    throw new RefineryError(
      "ERR_CONFIG",
      "Configuration could not be read.",
      { path: pathname, cause: error }
    );
  }
}

export async function loadConfig(
  overridePath?: string
): Promise<RefineryConfig> {
  const base = parseYaml(
    await readConfiguration(defaultConfigPath),
    defaultConfigPath
  );
  if (!overridePath) {
    return validateConfiguration(base);
  }
  const absoluteOverride = path.resolve(overridePath);
  const override = parseYaml(
    await readConfiguration(absoluteOverride),
    absoluteOverride
  );
  return validateConfiguration(mergeConfiguration(base, override));
}

export async function loadDefaultConfig(): Promise<RefineryConfig> {
  return loadConfig();
}
