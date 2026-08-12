#!/usr/bin/env node

import { existsSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import { spawnSync } from "node:child_process";

const packageRoot = path.resolve(import.meta.dirname, "..");
const bundledNpmCli = path.join(path.dirname(process.execPath), "node_modules", "npm", "bin", "npm-cli.js");
const npmCli = [process.env.npm_execpath, bundledNpmCli].find((candidate) => candidate && existsSync(candidate));
if (!npmCli) throw new Error("Unable to locate npm-cli.js for package validation.");

const packed = spawnSync(process.execPath, [npmCli, "pack", "--dry-run", "--json", "--ignore-scripts"], {
  cwd: packageRoot,
  encoding: "utf8"
});

if (packed.error) throw packed.error;
if (packed.status !== 0) {
  process.stderr.write(packed.stderr);
  process.exit(packed.status ?? 1);
}

const [result] = JSON.parse(packed.stdout);
const files = new Set(result.files.map(({ path: file }) => file.replaceAll("\\", "/")));
const required = [
  "package.json",
  "LICENSE",
  "README.md",
  "SKILL.md",
  "docs/USAGE.md",
  "scripts/neres-agentic.mjs",
  "scripts/install-codex.mjs",
  "scripts/install-opencode.mjs",
  "scripts/install-devin.mjs",
  "assets/codex/profiles/neres-planner.config.toml",
  "assets/opencode/agents/neres-planner.md",
  "assets/devin/skills/neres-planner/SKILL.md"
];
const forbiddenPrefixes = ["tests/", "fixtures/", "docs/ai/", "node_modules/"];
const missing = required.filter((file) => !files.has(file));
const forbidden = [...files].filter((file) => forbiddenPrefixes.some((prefix) => file.startsWith(prefix)));

if (missing.length || forbidden.length) {
  if (missing.length) process.stderr.write(`Missing package files: ${missing.join(", ")}\n`);
  if (forbidden.length) process.stderr.write(`Forbidden package files: ${forbidden.join(", ")}\n`);
  process.exit(1);
}

process.stdout.write(`Validated npm package ${result.id}: ${result.entryCount} files, ${result.size} bytes.\n`);
