#!/usr/bin/env node

import path from "node:path";
import process from "node:process";

import { validateCodexBundle } from "./codex-bundle.mjs";
import { codexModelInventory, codexVersion } from "./codex-runtime.mjs";

const bundleRoot = path.resolve(import.meta.dirname, "..");

try {
  const options = parseArguments(process.argv.slice(2));
  const version = options.modelsFile ? "fixture" : codexVersion();
  const modelIds = await codexModelInventory(options.modelsFile);
  const result = await validateCodexBundle({ bundleRoot, modelIds });
  if (!result.valid) {
    process.stderr.write(`${result.diagnostics.join("\n")}\n`);
    process.exitCode = 1;
  } else if (options.json) {
    process.stdout.write(`${JSON.stringify({ version, agents: result.agents, profiles: result.profiles }, null, 2)}\n`);
  } else {
    process.stdout.write(`Validated ${result.profiles.length} profiles and ${result.agents.length} agents for Codex ${version}.\n`);
  }
} catch (error) {
  process.stderr.write(`Validation failed: ${error instanceof Error ? error.message : "unknown error"}\n`);
  process.exitCode = 1;
}

function parseArguments(argv) {
  const options = { modelsFile: undefined, json: false };
  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (value === "--models-file") {
      if (!argv[index + 1]) throw new Error("--models-file requires a value.");
      options.modelsFile = path.resolve(argv[++index]);
    } else if (value === "--json") options.json = true;
    else throw new Error(`Unknown argument: ${value}`);
  }
  return options;
}
