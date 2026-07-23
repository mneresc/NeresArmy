import { access } from "node:fs/promises";
import { homedir } from "node:os";
import path from "node:path";

async function exists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function detectArchifyPath(
  explicitPath?: string
): Promise<string | undefined> {
  if (explicitPath) {
    return explicitPath;
  }
  const configured = process.env.NERES_ARCHIFY_PATH;
  const candidates = [
    configured,
    path.join(homedir(), ".codex", "skills", "archify", "bin", "archify.mjs"),
    path.join(homedir(), ".agents", "skills", "archify", "bin", "archify.mjs")
  ].filter((value): value is string => Boolean(value));
  for (const candidate of candidates) {
    if (await exists(candidate)) {
      return candidate;
    }
  }
  return undefined;
}
