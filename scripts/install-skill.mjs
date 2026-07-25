#!/usr/bin/env node

import os from "node:os";
import path from "node:path";
import process from "node:process";

import { installSkills } from "./skill-installer.mjs";

const repositoryRoot = path.resolve(import.meta.dirname, "..");
const home = os.homedir();

const TARGETS = {
  codex: path.join(home, ".codex", "skills"),
  agents: path.join(home, ".agents", "skills"),
  devin: path.join(process.cwd(), ".agents", "skills"),
  antigravity: path.join(home, ".gemini", "config", "skills"),
  claude: path.join(home, ".claude", "skills"),
  project: path.join(process.cwd(), ".agents", "skills")
};

function usage() {
  return `Install NeresArmy skills

Usage:
  node scripts/install-skill.mjs --skill <slug> --target <target>
  node scripts/install-skill.mjs --all --target <target>

Targets:
  codex | agents | devin | antigravity | claude | project | all

Options:
  --skill <slug>            Install one canonical skill (repeatable)
  --all                     Install every canonical skill
  --target <target>         Named destination
  --destination <directory> Custom parent directory instead of a named target
  --dry-run                 Show destinations without writing
  --force                   Replace an existing installed skill
  --help                    Show this help
`;
}

function parseArguments(argv) {
  const result = { skills: [], target: undefined, destination: undefined, all: false, dryRun: false, force: false, help: false };
  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (value === "--skill") result.skills.push(argv[++index]);
    else if (value === "--all") result.all = true;
    else if (value === "--target") result.target = argv[++index];
    else if (value === "--destination") result.destination = argv[++index];
    else if (value === "--dry-run") result.dryRun = true;
    else if (value === "--force") result.force = true;
    else if (value === "--help" || value === "-h") result.help = true;
    else throw new Error(`Unknown argument: ${value}`);
  }
  if (!result.help && result.all === (result.skills.length > 0)) {
    throw new Error("Choose exactly one of --skill <slug> or --all.");
  }
  return result;
}

function destinations(options) {
  if (options.destination) return [path.resolve(options.destination)];
  if (!options.target) throw new Error("--target or --destination is required.");
  if (options.target === "all") return [...new Set(Object.values(TARGETS))];
  const target = TARGETS[options.target];
  if (!target) throw new Error(`Unknown target: ${options.target}`);
  return [target];
}

try {
  const options = parseArguments(process.argv.slice(2));
  if (options.help) {
    process.stdout.write(usage());
  } else {
    for (const destination of destinations(options)) {
      const installed = await installSkills({
        repositoryRoot,
        destination,
        selected: options.all ? "all" : options.skills,
        force: options.force,
        dryRun: options.dryRun
      });
      for (const target of installed) {
        process.stdout.write(`${options.dryRun ? "Would install" : "Installed"}: ${target}\n`);
      }
    }
  }
} catch (error) {
  process.stderr.write(`Installation failed: ${error instanceof Error ? error.message : "unknown error"}\n`);
  process.exitCode = 1;
}
