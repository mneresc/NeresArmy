#!/usr/bin/env node

import path from "node:path";

import { validateSkills } from "./catalog.mjs";

const repositoryRoot = path.resolve(import.meta.dirname, "..");
const result = await validateSkills(repositoryRoot);
if (!result.valid) {
  process.stderr.write(`${result.diagnostics.join("\n")}\n`);
  process.exitCode = 1;
} else {
  process.stdout.write(`Validated ${result.skills.length} skill(s).\n`);
}
