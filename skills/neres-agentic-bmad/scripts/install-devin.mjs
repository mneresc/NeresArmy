#!/usr/bin/env node

import os from "node:os";
import path from "node:path";
import process from "node:process";

import { installBundledBmad } from "./bmad-bundle.mjs";
import { installDevinBundle } from "./devin-bundle.mjs";
import { devinModelInventory, devinVersion } from "./devin-runtime.mjs";

const bundleRoot = path.resolve(import.meta.dirname, "..");

try {
  const options = parseArguments(process.argv.slice(2));
  if (options.help) process.stdout.write(usage());
  else {
    const version = options.modelsFile ? "fixture" : devinVersion();
    const modelIds = await devinModelInventory(options.modelsFile);
    const base = options.target === "project" ? path.join(options.destinationRoot, ".agents") : options.destinationRoot;
    const bmadOptions = { bundleRoot, projectRoot: options.projectRoot, skillRoot: path.join(base, "skills"), language: options.language, skip: options.skipBmad };
    const bmadPreview = await installBundledBmad({ ...bmadOptions, dryRun: true });
    const result = await installDevinBundle({ bundleRoot, ...options, modelIds });
    const bmad = options.dryRun ? bmadPreview : await installBundledBmad(bmadOptions);
    if (options.json) process.stdout.write(`${JSON.stringify({ version, target: options.target, ...result, bmad }, null, 2)}\n`);
    else {
      process.stdout.write(`Devin: ${version}\nTarget: ${options.target}\n`);
      process.stdout.write(`BMAD: ${bmad.status}${bmad.version ? ` (${bmad.version})` : ""}\n`);
      for (const target of result.installed) process.stdout.write(`${result.dryRun ? "Would install" : "Installed"}: ${target}\n`);
      if (result.backupDirectory) process.stdout.write(`Backup: ${result.backupDirectory}\n`);
    }
  }
} catch (error) {
  process.stderr.write(`Installation failed: ${error instanceof Error ? error.message : "unknown error"}\n`);
  process.exitCode = 1;
}

function parseArguments(argv) {
  const options = {
    target: "project",
    destinationRoot: process.cwd(),
    modelsFile: undefined,
    backupDirectory: undefined,
    dryRun: false,
    force: false,
    json: false,
    help: false,
    projectRoot: process.cwd(),
    language: "en",
    skipBmad: false
  };
  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (value === "--target") options.target = requiredValue(argv, ++index, value);
    else if (value === "--project-root") options.projectRoot = path.resolve(requiredValue(argv, ++index, value));
    else if (value === "--language") options.language = requiredValue(argv, ++index, value);
    else if (value === "--destination-root") options.destinationRoot = path.resolve(requiredValue(argv, ++index, value));
    else if (value === "--models-file") options.modelsFile = path.resolve(requiredValue(argv, ++index, value));
    else if (value === "--backup-dir") options.backupDirectory = path.resolve(requiredValue(argv, ++index, value));
    else if (value === "--dry-run") options.dryRun = true;
    else if (value === "--force") options.force = true;
    else if (value === "--json") options.json = true;
    else if (value === "--skip-bmad") options.skipBmad = true;
    else if (value === "--help" || value === "-h") options.help = true;
    else throw new Error(`Unknown argument: ${value}`);
  }
  if (options.target === "user" && !argv.includes("--destination-root")) {
    options.destinationRoot = path.resolve(process.platform === "win32"
      ? path.join(process.env.APPDATA ?? path.join(os.homedir(), "AppData", "Roaming"), "devin")
      : path.join(os.homedir(), ".config", "devin"));
  }
  return options;
}

function requiredValue(argv, index, option) {
  if (!argv[index] || argv[index].startsWith("--")) throw new Error(`${option} requires a value.`);
  return argv[index];
}

function usage() {
  return `Install Neres Agentic BMAD for Devin CLI/Desktop\n\nUsage:\n  node scripts/install-devin.mjs [options]\n\nOptions:\n  --target <project|user>       Project .agents or Devin user home (default: project)\n  --project-root <directory>    Project receiving bundled _bmad (default: current)\n  --language <pt|en|es>         BMAD document language (default: en)\n  --skip-bmad                   Install only Neres assets\n  --destination-root <path>     Project root or explicit Devin user root\n  --models-file <file>          Saved output compatible with devin models list --format json\n  --backup-dir <directory>      Explicit backup root when using --force\n  --dry-run                     Validate and show targets without writing\n  --force                       Back up and replace managed destinations\n  --json                        Emit machine-readable result\n  --help                        Show this help\n`;
}
