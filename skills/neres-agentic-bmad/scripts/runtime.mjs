import { readFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";

export async function modelInventory(modelsFile) {
  if (modelsFile) return lines(await readFile(modelsFile, "utf8"));
  const result = spawnSync("opencode", ["models"], { encoding: "utf8", shell: process.platform === "win32" });
  if (result.status !== 0) throw new Error(`opencode models failed: ${(result.stderr || result.stdout).trim()}`);
  return lines(result.stdout);
}

export function opencodeVersion() {
  const result = spawnSync("opencode", ["--version"], { encoding: "utf8", shell: process.platform === "win32" });
  if (result.status !== 0) throw new Error(`opencode --version failed: ${(result.stderr || result.stdout).trim()}`);
  const version = result.stdout.trim();
  if (!/^\d+\.\d+\.\d+$/.test(version)) throw new Error(`Unexpected OpenCode version: ${version}`);
  const [major, minor, patch] = version.split(".").map(Number);
  if (major < 1 || (major === 1 && minor < 1) || (major === 1 && minor === 1 && patch < 1)) {
    throw new Error(`OpenCode ${version} is unsupported; permission syntax requires 1.1.1 or newer.`);
  }
  return version;
}

function lines(source) {
  return source.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
}
