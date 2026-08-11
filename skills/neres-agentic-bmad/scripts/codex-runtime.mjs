import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

export function codexVersion() {
  return runCodex(["--version"]).trim();
}

export async function codexModelInventory(modelsFile) {
  const source = modelsFile
    ? await readFile(modelsFile, "utf8")
    : runCodex(["debug", "models"], 32 * 1024 * 1024);
  const parsed = JSON.parse(source);
  return (parsed.models ?? []).map((model) => model.slug).filter(Boolean);
}

function runCodex(args, maxBuffer = 1024 * 1024) {
  const invocation = codexInvocation();
  return execFileSync(invocation.command, [...invocation.prefix, ...args], {
    encoding: "utf8",
    maxBuffer
  });
}

function codexInvocation() {
  if (process.platform !== "win32") return { command: "codex", prefix: [] };
  const commandShim = execFileSync("where.exe", ["codex.cmd"], { encoding: "utf8" })
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find(Boolean);
  const launcher = commandShim
    ? path.join(path.dirname(commandShim), "node_modules", "@openai", "codex", "bin", "codex.js")
    : null;
  if (!launcher || !existsSync(launcher)) {
    throw new Error("Cannot resolve the npm Codex launcher from PATH on Windows.");
  }
  return { command: process.execPath, prefix: [launcher] };
}
