import { readFile } from "node:fs/promises";
import type {
  VisualContentExtractor,
  VisualExtractionResult,
  VisualInput
} from "../contracts.ts";
import { RefineryError } from "../errors.ts";
import { validateVisualPayload } from "./validate-result.ts";

interface ManifestSource {
  sourcePath: string;
  sourceSha256: string;
  payload: unknown;
}

export class ManifestVisualExtractor implements VisualContentExtractor {
  readonly provider = "agent-manifest" as const;
  readonly requiresExternalAccess = false;
  readonly #sources: Map<string, ManifestSource>;

  private constructor(sources: ManifestSource[]) {
    this.#sources = new Map(
      sources.map((source) => [
        source.sourcePath.replaceAll("\\", "/").toLocaleLowerCase("en-US"),
        source
      ])
    );
  }

  static async fromFile(filePath: string): Promise<ManifestVisualExtractor> {
    let parsed: unknown;
    try {
      parsed = JSON.parse(await readFile(filePath, "utf8"));
    } catch (error) {
      throw new RefineryError(
        "ERR_VISUAL_MANIFEST",
        "Visual manifest could not be read as JSON.",
        { path: filePath, cause: error }
      );
    }
    if (
      typeof parsed !== "object" ||
      parsed === null ||
      Array.isArray(parsed) ||
      (parsed as { version?: unknown }).version !== 1 ||
      !Array.isArray((parsed as { sources?: unknown }).sources)
    ) {
      throw new RefineryError(
        "ERR_VISUAL_MANIFEST",
        "Visual manifest must have version 1 and a sources array.",
        { path: filePath }
      );
    }
    const sources = (parsed as { sources: unknown[] }).sources.map((value) => {
      if (typeof value !== "object" || value === null || Array.isArray(value)) {
        throw new RefineryError(
          "ERR_VISUAL_MANIFEST",
          "Each visual manifest source must be an object.",
          { path: filePath }
        );
      }
      const source = value as Record<string, unknown>;
      if (
        typeof source.sourcePath !== "string" ||
        typeof source.sourceSha256 !== "string" ||
        !/^[a-f0-9]{64}$/u.test(source.sourceSha256)
      ) {
        throw new RefineryError(
          "ERR_VISUAL_MANIFEST",
          "Visual manifest sources require path and SHA-256.",
          { path: filePath }
        );
      }
      return {
        sourcePath: source.sourcePath,
        sourceSha256: source.sourceSha256,
        payload: value
      };
    });
    return new ManifestVisualExtractor(sources);
  }

  async extract(input: VisualInput): Promise<VisualExtractionResult> {
    const key = input.sourcePath
      .replaceAll("\\", "/")
      .toLocaleLowerCase("en-US");
    const source = this.#sources.get(key);
    if (!source) {
      throw new RefineryError(
        "ERR_VISUAL_MANIFEST",
        "Visual manifest has no entry for the authorized image.",
        { path: input.sourcePath }
      );
    }
    if (source.sourceSha256 !== input.sha256) {
      throw new RefineryError(
        "ERR_VISUAL_MANIFEST",
        "Visual manifest SHA-256 does not match the authorized image.",
        { path: input.sourcePath }
      );
    }
    return validateVisualPayload(source.payload, this.provider, {
      id: input.sourceId,
      path: input.sourcePath,
      sha256: input.sha256
    });
  }
}
