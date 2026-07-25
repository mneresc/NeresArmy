#!/usr/bin/env node

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { renderCatalog, validateSkills } from "./catalog.mjs";

const repositoryRoot = path.resolve(import.meta.dirname, "..");
const result = await validateSkills(repositoryRoot);
if (!result.valid) {
  process.stderr.write(`${result.diagnostics.join("\n")}\n`);
  process.exitCode = 1;
} else {
  const output = path.join(repositoryRoot, "docs", "CATALOG.md");
  await mkdir(path.dirname(output), { recursive: true });
  await writeFile(output, renderCatalog(result.skills), "utf8");
  process.stdout.write(`Generated: ${output}\n`);
}
