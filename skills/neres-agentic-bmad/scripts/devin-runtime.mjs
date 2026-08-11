import { readFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";

export function devinVersion() {
  return run(["--version"]);
}

export async function devinModelInventory(modelsFile) {
  const source = modelsFile ? await readFile(modelsFile, "utf8") : run(["models", "list", "--format", "json"]);
  let parsed;
  try { parsed = JSON.parse(source); }
  catch (error) { throw new Error(`Cannot parse Devin model inventory: ${error instanceof Error ? error.message : "unknown error"}`); }
  const identifiers = new Set();
  collectIdentifiers(parsed, identifiers);
  return [...identifiers];
}

function collectIdentifiers(value, output) {
  if (Array.isArray(value)) {
    for (const item of value) collectIdentifiers(item, output);
    return;
  }
  if (!value || typeof value !== "object") return;
  for (const [key, item] of Object.entries(value)) {
    if (["id", "name", "slug", "model", "alias"].includes(key.toLowerCase()) && typeof item === "string") output.add(item);
    else collectIdentifiers(item, output);
  }
}

function run(args) {
  const command = process.platform === "win32" ? (process.env.ComSpec ?? "cmd.exe") : "devin";
  const commandArgs = process.platform === "win32" ? ["/d", "/s", "/c", "devin", ...args] : args;
  const result = spawnSync(command, commandArgs, { encoding: "utf8", windowsHide: true });
  if (result.error) throw new Error(`Devin CLI is unavailable: ${result.error.message}`);
  if (result.status !== 0) throw new Error(`Devin CLI failed: ${(result.stderr || result.stdout || "unknown error").trim()}`);
  return result.stdout.trim();
}
