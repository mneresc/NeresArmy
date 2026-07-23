import { realpath, stat } from "node:fs/promises";
import path from "node:path";
import { RefineryError } from "../errors.ts";

export function normalizeUserPath(value: string): string {
  return value.replace(/[\\/]+/g, path.sep);
}

function comparisonPath(value: string): string {
  const normalized = path.resolve(value);
  return process.platform === "win32" ? normalized.toLocaleLowerCase("en-US") : normalized;
}

export function isSameOrDescendant(root: string, candidate: string): boolean {
  const relative = path.relative(comparisonPath(root), comparisonPath(candidate));
  return (
    relative === "" ||
    (!relative.startsWith(`..${path.sep}`) &&
      relative !== ".." &&
      !path.isAbsolute(relative))
  );
}

export async function resolveVaultRoot(vault: string): Promise<string> {
  const lexical = path.resolve(normalizeUserPath(vault));
  let resolved: string;
  try {
    resolved = await realpath(lexical);
  } catch (error) {
    throw new RefineryError("ERR_VAULT_NOT_FOUND", "Vault directory does not exist.", {
      path: lexical,
      cause: error
    });
  }

  const metadata = await stat(resolved);
  if (!metadata.isDirectory()) {
    throw new RefineryError("ERR_VAULT_NOT_FOUND", "Vault path is not a directory.", {
      path: resolved
    });
  }
  return resolved;
}

export async function resolveExistingWithinVault(
  vaultRoot: string,
  requestedPath: string,
  missingCode: "ERR_INPUT_NOT_FOUND" = "ERR_INPUT_NOT_FOUND"
): Promise<string> {
  const normalized = normalizeUserPath(requestedPath);
  const lexical = path.isAbsolute(normalized)
    ? path.resolve(normalized)
    : path.resolve(vaultRoot, normalized);

  if (!isSameOrDescendant(vaultRoot, lexical)) {
    throw new RefineryError("ERR_OUTSIDE_VAULT", "Path is outside the authorized vault.", {
      path: lexical
    });
  }

  let resolved: string;
  try {
    resolved = await realpath(lexical);
  } catch (error) {
    throw new RefineryError(missingCode, "Input path does not exist.", {
      path: lexical,
      cause: error
    });
  }

  if (!isSameOrDescendant(vaultRoot, resolved)) {
    throw new RefineryError(
      "ERR_OUTSIDE_VAULT",
      "Resolved path is outside the authorized vault.",
      { path: lexical }
    );
  }
  return resolved;
}

async function nearestExistingAncestor(target: string): Promise<string> {
  let current = target;
  while (true) {
    try {
      await stat(current);
      return current;
    } catch {
      const parent = path.dirname(current);
      if (parent === current) {
        throw new RefineryError(
          "ERR_OUTSIDE_VAULT",
          "Output path has no verifiable ancestor.",
          { path: target }
        );
      }
      current = parent;
    }
  }
}

export async function resolveOutputWithinVault(
  vaultRoot: string,
  requestedOutput: string
): Promise<string> {
  const normalized = normalizeUserPath(requestedOutput);
  const lexical = path.isAbsolute(normalized)
    ? path.resolve(normalized)
    : path.resolve(vaultRoot, normalized);

  if (!isSameOrDescendant(vaultRoot, lexical)) {
    throw new RefineryError("ERR_OUTSIDE_VAULT", "Output is outside the authorized vault.", {
      path: lexical
    });
  }

  const ancestor = await nearestExistingAncestor(lexical);
  const resolvedAncestor = await realpath(ancestor);
  if (!isSameOrDescendant(vaultRoot, resolvedAncestor)) {
    throw new RefineryError(
      "ERR_OUTSIDE_VAULT",
      "Output resolves through an ancestor outside the vault.",
      { path: lexical }
    );
  }

  const suffix = path.relative(ancestor, lexical);
  return path.resolve(resolvedAncestor, suffix);
}

export function toVaultRelative(vaultRoot: string, absolutePath: string): string {
  const relative = path.relative(vaultRoot, absolutePath);
  return relative.split(path.sep).join("/");
}
