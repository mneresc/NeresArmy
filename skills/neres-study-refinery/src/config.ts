import { readFile } from "node:fs/promises";
import path from "node:path";
import { parseDocument } from "yaml";
import type { CompressionMode, DiagramMode, Profile } from "./contracts.ts";
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
  };
  transformation: {
    compression: CompressionMode;
  };
  diagrams: {
    mode: DiagramMode;
    provider: "archify";
  };
}

const defaultConfigPath = path.resolve(
  import.meta.dirname,
  "../config/default-config.yaml"
);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function requireRecord(
  value: unknown,
  key: string
): Record<string, unknown> {
  if (!isRecord(value)) {
    throw new RefineryError("ERR_CONFIG", `Configuration section '${key}' is invalid.`);
  }
  return value;
}

function requireBoolean(
  record: Record<string, unknown>,
  key: string
): boolean {
  const value = record[key];
  if (typeof value !== "boolean") {
    throw new RefineryError("ERR_CONFIG", `Configuration value '${key}' must be boolean.`);
  }
  return value;
}

function requireString(
  record: Record<string, unknown>,
  key: string
): string {
  const value = record[key];
  if (typeof value !== "string") {
    throw new RefineryError("ERR_CONFIG", `Configuration value '${key}' must be a string.`);
  }
  return value;
}

export async function loadDefaultConfig(): Promise<RefineryConfig> {
  let source: string;
  try {
    source = await readFile(defaultConfigPath, "utf8");
  } catch (error) {
    throw new RefineryError("ERR_CONFIG", "Default configuration could not be read.", {
      path: defaultConfigPath,
      cause: error
    });
  }

  const document = parseDocument(source, {
    schema: "core",
    uniqueKeys: true,
    customTags: []
  });
  if (document.errors.length > 0) {
    throw new RefineryError(
      "ERR_CONFIG",
      `Default configuration is invalid: ${document.errors[0]?.message ?? "parse error"}.`
    );
  }
  if (document.warnings.length > 0) {
    throw new RefineryError(
      "ERR_CONFIG",
      `Default configuration has warnings: ${document.warnings[0]?.message ?? "warning"}.`
    );
  }

  const root = requireRecord(document.toJS(), "root");
  const input = requireRecord(root.input, "input");
  const scope = requireRecord(root.scope, "scope");
  const classification = requireRecord(root.classification, "classification");
  const output = requireRecord(root.output, "output");
  const transformation = requireRecord(root.transformation, "transformation");
  const diagrams = requireRecord(root.diagrams, "diagrams");
  const excludedDirectories = scope.excluded_directories;

  if (
    !Array.isArray(excludedDirectories) ||
    excludedDirectories.some((value) => typeof value !== "string")
  ) {
    throw new RefineryError(
      "ERR_CONFIG",
      "Configuration value 'excluded_directories' must be a string array."
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
      excluded_directories: [...excludedDirectories]
    },
    classification: {
      profile: requireString(classification, "profile") as Profile,
      detect_per_section: requireBoolean(classification, "detect_per_section"),
      preserve_structured_notes: requireBoolean(
        classification,
        "preserve_structured_notes"
      )
    },
    output: {
      mode: requireString(output, "mode") as "separate-folder",
      overwrite_originals: requireBoolean(output, "overwrite_originals")
    },
    transformation: {
      compression: requireString(
        transformation,
        "compression"
      ) as CompressionMode
    },
    diagrams: {
      mode: requireString(diagrams, "mode") as DiagramMode,
      provider: requireString(diagrams, "provider") as "archify"
    }
  };
}
