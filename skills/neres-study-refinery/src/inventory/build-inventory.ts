import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import type {
  InventorySource,
  PlannedEntry,
  ResolvedScope,
  SourceInventory
} from "../contracts.ts";
import { analyzeMarkdown } from "../markdown/analyze.ts";
import { toVaultRelative } from "../scope/boundary.ts";

function sha256(bytes: Buffer): string {
  return createHash("sha256").update(bytes).digest("hex");
}

function normalizeRelative(value: string): string {
  return path.posix.normalize(value.replaceAll("\\", "/")).replace(/^\.\//u, "");
}

function embedCandidates(notePath: string, target: string): string[] {
  const normalized = normalizeRelative(target);
  if (path.posix.isAbsolute(normalized) || /^[A-Za-z]:\//u.test(normalized)) {
    return [];
  }
  return [
    normalizeRelative(path.posix.join(path.posix.dirname(notePath), normalized)),
    normalized
  ];
}

export async function buildSourceInventory(
  scope: ResolvedScope,
  entries: readonly PlannedEntry[]
): Promise<SourceInventory> {
  const sources: InventorySource[] = [];

  for (const [index, entry] of entries.entries()) {
    const bytes = await readFile(entry.absolutePath);
    const source: InventorySource = {
      id: `source-${String(index + 1).padStart(3, "0")}`,
      type: entry.kind,
      path: entry.path,
      size: bytes.byteLength,
      sha256: sha256(bytes),
      status: entry.kind === "markdown" ? "processed" : "pending",
      origin: entry.origin
    };
    if (entry.kind === "markdown") {
      source.markdown = analyzeMarkdown(bytes.toString("utf8"));
    }
    sources.push(source);
  }

  const imagesByPath = new Map(
    sources
      .filter((source) => source.type === "image")
      .map((source) => [source.path.toLocaleLowerCase("en-US"), source])
  );
  for (const source of sources) {
    if (source.type !== "markdown" || !source.markdown) {
      continue;
    }
    for (const embed of source.markdown.embeds) {
      for (const candidate of embedCandidates(source.path, embed)) {
        const image = imagesByPath.get(candidate.toLocaleLowerCase("en-US"));
        if (!image) {
          continue;
        }
        image.referencedBy = [...new Set([...(image.referencedBy ?? []), source.path])];
        break;
      }
    }
  }

  return {
    scope: {
      type: scope.inputType,
      path: toVaultRelative(scope.vaultRoot, scope.inputPath),
      include_subfolders: scope.includeSubfolders
    },
    sources
  };
}
