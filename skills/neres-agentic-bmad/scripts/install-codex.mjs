#!/usr/bin/env node

import os from "node:os";
import path from "node:path";
import process from "node:process";

import { installCodexBundle } from "./codex-bundle.mjs";
import { codexModelInventory, codexVersion } from "./codex-runtime.mjs";

const bundleRoot = path.resolve(import.meta.dirname, "..");

try {
  const options = parseArguments(process.argv.slice(2));
  if (options.help) {
    process.stdout.write(usage());
  } else {
    const version = options.modelsFile ? "fixture" : codexVersion();
    const modelIds = await codexModelInventory(options.modelsFile);
    const result = await installCodexBundle({
      bundleRoot,
      codexHome: options.codexHome,
      modelIds,
      dryRun: options.dryRun,
      force: options.force,
      backupDirectory: options.backupDirectory
    });
    if (options.json) process.stdout.write(`${JSON.stringify({ version, ...result }, null, 2)}\n`);
    else {
      process.stdout.write(`Codex: ${version}\n`);
      for (const target of result.installed) {
        process.stdout.write(`${result.dryRun ? "Would install" : "Installed"}: ${target}\n`);
      }
      if (result.backupDirectory) process.stdout.write(`Backup: ${result.backupDirectory}\n`);
    }
  }
} catch (error) {
  process.stderr.write(`Installation failed: ${error instanceof Error ? error.message : "unknown error"}\n`);
  process.exitCode = 1;
}

function parseArguments(argv) {
  const options = {
    codexHome: path.resolve(process.env.CODEX_HOME ?? path.join(os.homedir(), ".codex")),
    modelsFile: undefined,
    backupDirectory: undefined,
    dryRun: false,
    force: false,
    json: false,
    help: false
  };
  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (value === "--codex-home") options.codexHome = path.resolve(requiredValue(argv, ++index, value));
    else if (value === "--models-file") options.modelsFile = path.resolve(requiredValue(argv, ++index, value));
    else if (value === "--backup-dir") options.backupDirectory = path.resolve(requiredValue(argv, ++index, value));
    else if (value === "--dry-run") options.dryRun = true;
    else if (value === "--force") options.force = true;
    else if (value === "--json") options.json = true;
    else if (value === "--help" || value === "-h") options.help = true;
    else throw new Error(`Unknown argument: ${value}`);
  }
  return options;
}

function requiredValue(argv, index, option) {
  if (!argv[index] || argv[index].startsWith("--")) throw new Error(`${option} requires a value.`);
  return argv[index];
}

function usage() {
  return `Install Neres Agentic BMAD for Codex

Usage:
  node scripts/install-codex.mjs [options]

Options:
  --codex-home <directory>  Codex home (default: ~/.codex)
  --models-file <file>      Validate against a saved Codex model inventory
  --backup-dir <directory>  Explicit backup root when using --force
  --dry-run                 Validate and show targets without writing
  --force                   Back up and replace managed destinations
  --json                    Emit machine-readable result
  --help                    Show this help
`;
}
