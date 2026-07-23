import { readFile, readdir, realpath, stat } from "node:fs/promises";
import path from "node:path";
import type {
  PlannedEntry,
  PlannedEntryKind,
  RejectedEntry,
  ResolvedScope
} from "../contracts.ts";
import { findObsidianEmbeds } from "../markdown/embeds.ts";
import {
  isSameOrDescendant,
  normalizeUserPath,
  toVaultRelative
} from "./boundary.ts";

const IMAGE_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".webp"]);
const collator = new Intl.Collator("en", {
  numeric: true,
  sensitivity: "base",
  usage: "sort"
});

function comparePaths(left: string, right: string): number {
  const collated = collator.compare(left, right);
  return collated === 0 ? (left < right ? -1 : left > right ? 1 : 0) : collated;
}

function kindForFile(filePath: string): PlannedEntryKind | undefined {
  const extension = path.extname(filePath).toLocaleLowerCase();
  if (extension === ".md") {
    return "markdown";
  }
  if (IMAGE_EXTENSIONS.has(extension)) {
    return "image";
  }
  return undefined;
}

function excludedNameSet(scope: ResolvedScope): Set<string> {
  return new Set(
    scope.excludedDirectoryNames.map((name) => name.toLocaleLowerCase("en-US"))
  );
}

function comparisonPath(value: string): string {
  return process.platform === "win32"
    ? value.toLocaleLowerCase("en-US")
    : value;
}

function containsExcludedSegment(
  scope: ResolvedScope,
  absolutePath: string,
  excludedNames: ReadonlySet<string>
): boolean {
  return path
    .relative(scope.vaultRoot, absolutePath)
    .split(path.sep)
    .some((segment) =>
      excludedNames.has(segment.toLocaleLowerCase("en-US"))
    );
}

function displayPath(scope: ResolvedScope, absolutePath: string): string {
  if (isSameOrDescendant(scope.vaultRoot, absolutePath)) {
    return toVaultRelative(scope.vaultRoot, absolutePath);
  }
  return absolutePath.split(path.sep).join("/");
}

async function collectEmbeddedImages(
  scope: ResolvedScope,
  notePath: string
): Promise<{ entries: PlannedEntry[]; rejected: RejectedEntry[] }> {
  const markdown = await readFile(notePath, "utf8");
  const entries: PlannedEntry[] = [];
  const rejected: RejectedEntry[] = [];

  for (const target of findObsidianEmbeds(markdown)) {
    const normalizedTarget = normalizeUserPath(target);
    const candidates = path.isAbsolute(normalizedTarget)
      ? [path.resolve(normalizedTarget)]
      : [
          path.resolve(path.dirname(notePath), normalizedTarget),
          path.resolve(scope.vaultRoot, normalizedTarget)
        ];

    let resolved: string | undefined;
    let existsOutside = false;
    for (const candidate of candidates) {
      try {
        const candidateRealPath = await realpath(candidate);
        if (!isSameOrDescendant(scope.vaultRoot, candidateRealPath)) {
          existsOutside = true;
          continue;
        }
        resolved = candidateRealPath;
        break;
      } catch {
        // Try the next Obsidian resolution root.
      }
    }

    if (!resolved) {
      rejected.push({
        path: normalizedTarget.split(path.sep).join("/"),
        reason: existsOutside || path.isAbsolute(normalizedTarget)
          ? "outside-vault"
          : "not-found"
      });
      continue;
    }

    const kind = kindForFile(resolved);
    if (kind !== "image") {
      rejected.push({
        path: displayPath(scope, resolved),
        reason: "unsupported-type"
      });
      continue;
    }

    entries.push({
      path: toVaultRelative(scope.vaultRoot, resolved),
      absolutePath: resolved,
      kind,
      origin: "embed"
    });
  }

  return { entries, rejected };
}

async function collectNote(
  scope: ResolvedScope
): Promise<{ entries: PlannedEntry[]; rejected: RejectedEntry[] }> {
  const entries: PlannedEntry[] = [
    {
      path: toVaultRelative(scope.vaultRoot, scope.inputPath),
      absolutePath: scope.inputPath,
      kind: "markdown",
      origin: "input"
    }
  ];
  const embedded = await collectEmbeddedImages(scope, scope.inputPath);
  entries.push(...embedded.entries);
  return { entries, rejected: embedded.rejected };
}

async function collectFolder(
  scope: ResolvedScope
): Promise<{ entries: PlannedEntry[]; rejected: RejectedEntry[] }> {
  const entries: PlannedEntry[] = [];
  const rejected: RejectedEntry[] = [];
  const excludedNames = excludedNameSet(scope);
  const visitedDirectories = new Set<string>([
    comparisonPath(scope.inputPath)
  ]);

  async function visit(directory: string, depth: number): Promise<void> {
    const children = await readdir(directory, { withFileTypes: true });
    children.sort((left, right) => comparePaths(left.name, right.name));

    for (const child of children) {
      const absolute = path.join(directory, child.name);
      const relative = toVaultRelative(scope.vaultRoot, absolute);
      const lowerName = child.name.toLocaleLowerCase("en-US");

      if (child.isDirectory() || child.isSymbolicLink()) {
        if (
          excludedNames.has(lowerName) ||
          isSameOrDescendant(scope.outputPath, absolute)
        ) {
          rejected.push({ path: relative, reason: "excluded-directory" });
          continue;
        }

        let resolved: string;
        try {
          resolved = await realpath(absolute);
        } catch {
          rejected.push({ path: relative, reason: "not-found" });
          continue;
        }
        if (!isSameOrDescendant(scope.vaultRoot, resolved)) {
          rejected.push({ path: relative, reason: "outside-vault" });
          continue;
        }
        const metadata = await stat(resolved);
        if (!metadata.isDirectory()) {
          rejected.push({ path: relative, reason: "unsupported-type" });
          continue;
        }
        if (
          isSameOrDescendant(scope.outputPath, resolved) ||
          containsExcludedSegment(scope, resolved, excludedNames) ||
          visitedDirectories.has(comparisonPath(resolved))
        ) {
          rejected.push({ path: relative, reason: "excluded-directory" });
          continue;
        }
        if (scope.includeSubfolders) {
          visitedDirectories.add(comparisonPath(resolved));
          await visit(resolved, depth + 1);
        }
        continue;
      }

      if (!child.isFile()) {
        rejected.push({ path: relative, reason: "unsupported-type" });
        continue;
      }

      const resolved = await realpath(absolute);
      if (!isSameOrDescendant(scope.vaultRoot, resolved)) {
        rejected.push({ path: relative, reason: "outside-vault" });
        continue;
      }
      const kind = kindForFile(resolved);
      if (!kind) {
        rejected.push({ path: relative, reason: "unsupported-type" });
        continue;
      }
      entries.push({
        path: relative,
        absolutePath: resolved,
        kind,
        origin: "folder"
      });
    }
  }

  await visit(scope.inputPath, 0);
  return { entries, rejected };
}

export async function collectScopeEntries(
  scope: ResolvedScope
): Promise<{ entries: PlannedEntry[]; rejected: RejectedEntry[] }> {
  const collected =
    scope.inputType === "note"
      ? await collectNote(scope)
      : await collectFolder(scope);

  const uniqueEntries = new Map<string, PlannedEntry>();
  for (const entry of collected.entries) {
    uniqueEntries.set(entry.path.toLocaleLowerCase("en-US"), entry);
  }
  const entries = [...uniqueEntries.values()].sort((left, right) =>
    comparePaths(left.path, right.path)
  );
  const rejected = [...collected.rejected].sort((left, right) =>
    comparePaths(left.path, right.path)
  );
  return { entries, rejected };
}
