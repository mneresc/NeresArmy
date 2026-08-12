#!/usr/bin/env node

import os from "node:os";
import path from "node:path";
import process from "node:process";

import { installBundledBmad } from "./bmad-bundle.mjs";
import { installClaudeBundle } from "./claude-bundle.mjs";

const bundleRoot = path.resolve(import.meta.dirname, "..");

try {
  const options = parse(process.argv.slice(2));
  if (options.help) process.stdout.write(usage());
  else {
    const base = options.target === "project" ? path.join(options.destinationRoot, ".claude") : options.destinationRoot;
    const bmadOptions = { bundleRoot, projectRoot: options.projectRoot, skillRoot: path.join(base, "skills"), language: options.language, skip: options.skipBmad };
    const bmadPreview = await installBundledBmad({ ...bmadOptions, dryRun: true });
    const result = await installClaudeBundle({ bundleRoot, ...options });
    const bmad = options.dryRun ? bmadPreview : await installBundledBmad(bmadOptions);
    const output = { version: "native", target: options.target, ...result, bmad };
    if (options.json) process.stdout.write(`${JSON.stringify(output, null, 2)}\n`);
    else {
      process.stdout.write(`Claude Code\nTarget: ${options.target}\nBMAD: ${bmad.status}${bmad.version ? ` (${bmad.version})` : ""}\n`);
      for (const target of result.installed) process.stdout.write(`${result.dryRun ? "Would install" : "Installed"}: ${target}\n`);
    }
  }
} catch (error) { process.stderr.write(`Installation failed: ${error instanceof Error ? error.message : "unknown error"}\n`); process.exitCode = 1; }

function parse(argv) {
  const options = { target: "project", destinationRoot: process.cwd(), projectRoot: process.cwd(), dryRun: false, force: false, json: false, help: false, skipBmad: false, language: "en" };
  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (value === "--target") options.target = required(argv, ++index, value);
    else if (value === "--destination-root") options.destinationRoot = path.resolve(required(argv, ++index, value));
    else if (value === "--project-root") options.projectRoot = path.resolve(required(argv, ++index, value));
    else if (value === "--language") options.language = required(argv, ++index, value);
    else if (value === "--backup-dir") options.backupDirectory = path.resolve(required(argv, ++index, value));
    else if (value === "--dry-run") options.dryRun = true;
    else if (value === "--force") options.force = true;
    else if (value === "--skip-bmad") options.skipBmad = true;
    else if (value === "--json") options.json = true;
    else if (value === "--help" || value === "-h") options.help = true;
    else throw new Error(`Unknown argument: ${value}`);
  }
  if (options.target === "user" && !argv.includes("--destination-root")) options.destinationRoot = path.join(os.homedir(), ".claude");
  return options;
}
function required(argv, index, option) { if (!argv[index] || argv[index].startsWith("--")) throw new Error(`${option} requires a value.`); return argv[index]; }
function usage() { return `Install Neres Agentic BMAD for Claude Code\n\nOptions:\n  --target <project|user>\n  --destination-root <path>\n  --project-root <path>\n  --language <pt|en|es>\n  --skip-bmad\n  --dry-run\n  --force\n  --json\n`; }
