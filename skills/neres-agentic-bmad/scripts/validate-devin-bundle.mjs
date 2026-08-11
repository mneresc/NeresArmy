#!/usr/bin/env node

import path from "node:path";
import process from "node:process";

import { validateDevinBundle } from "./devin-bundle.mjs";
import { devinModelInventory, devinVersion } from "./devin-runtime.mjs";

const bundleRoot = path.resolve(import.meta.dirname, "..");

try {
  const modelsFile = argumentValue(process.argv.slice(2), "--models-file");
  const version = modelsFile ? "fixture" : devinVersion();
  const modelIds = await devinModelInventory(modelsFile && path.resolve(modelsFile));
  const result = await validateDevinBundle({ bundleRoot, modelIds });
  if (!result.valid) throw new Error(result.diagnostics.join("\n"));
  process.stdout.write(`Validated 4 skills and ${result.agents.length} agents for Devin ${version}.\n`);
} catch (error) {
  process.stderr.write(`Validation failed: ${error instanceof Error ? error.message : "unknown error"}\n`);
  process.exitCode = 1;
}

function argumentValue(argv, option) {
  const index = argv.indexOf(option);
  if (index < 0) return undefined;
  if (!argv[index + 1] || argv[index + 1].startsWith("--")) throw new Error(`${option} requires a value.`);
  return argv[index + 1];
}
