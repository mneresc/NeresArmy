#!/usr/bin/env node

import {
  access,
  cp,
  mkdir,
  rm
} from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import process from "node:process";

const repositoryRoot = path.resolve(import.meta.dirname, "..");
const skillName = "neres-study-refinery";
const sourceRoot = path.join(repositoryRoot, "skills", skillName);
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
  return `Install Neres Study Refinery

Usage:
  node scripts/install-skill.mjs --target <target>

Targets:
  codex | agents | devin | antigravity | claude | project | all

Options:
  --destination <directory>  Custom parent directory instead of a named target
  --dry-run                  Show destinations without writing
  --force                    Replace an existing neres-study-refinery directory
  --help                     Show this help
`;
}

function parseArguments(argv) {
  const result = {
    target: undefined,
    destination: undefined,
    dryRun: false,
    force: false,
    help: false
  };
  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (value === "--target") result.target = argv[++index];
    else if (value === "--destination") result.destination = argv[++index];
    else if (value === "--dry-run") result.dryRun = true;
    else if (value === "--force") result.force = true;
    else if (value === "--help" || value === "-h") result.help = true;
    else throw new Error(`Unknown argument: ${value}`);
  }
  return result;
}

async function exists(target) {
  try {
    await access(target);
    return true;
  } catch {
    return false;
  }
}

async function ensureBuilt() {
  const executable = path.join(
    sourceRoot,
    "dist",
    "neres-study-refinery.mjs"
  );
  if (!(await exists(executable))) {
    throw new Error(
      "The standalone executable is missing. Run npm run build first."
    );
  }
}

function destinations(options) {
  if (options.destination) {
    return [path.resolve(options.destination)];
  }
  if (!options.target) {
    throw new Error("--target or --destination is required.");
  }
  if (options.target === "all") {
    return [...new Set([
      TARGETS.codex,
      TARGETS.agents,
      TARGETS.antigravity,
      TARGETS.claude
    ])];
  }
  const target = TARGETS[options.target];
  if (!target) {
    throw new Error(`Unknown target: ${options.target}`);
  }
  return [target];
}

async function install(destination, options) {
  const target = path.join(destination, skillName);
  if (options.dryRun) {
    process.stdout.write(`Would install: ${target}\n`);
    return;
  }
  if (await exists(target)) {
    if (!options.force) {
      throw new Error(
        `Destination already exists: ${target}. Use --force to replace it.`
      );
    }
    await rm(target, { recursive: true, force: true });
  }
  await mkdir(destination, { recursive: true });
  await cp(sourceRoot, target, {
    recursive: true,
    filter(source) {
      const relative = path.relative(sourceRoot, source);
      const first = relative.split(path.sep)[0];
      return ![
        "src",
        "tests",
        "scripts",
        "coverage",
        "node_modules"
      ].includes(first);
    }
  });
  process.stdout.write(`Installed: ${target}\n`);
}

try {
  const options = parseArguments(process.argv.slice(2));
  if (options.help) {
    process.stdout.write(usage());
    process.exitCode = 0;
  } else {
    await ensureBuilt();
    for (const destination of destinations(options)) {
      await install(destination, options);
    }
  }
} catch (error) {
  process.stderr.write(
    `Installation failed: ${error instanceof Error ? error.message : "unknown error"}\n`
  );
  process.exitCode = 1;
}
