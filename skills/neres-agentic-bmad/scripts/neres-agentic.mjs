#!/usr/bin/env node

import { readFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import { spawnSync } from "node:child_process";

const packageRoot = path.resolve(import.meta.dirname, "..");
const manifest = JSON.parse(readFileSync(path.join(packageRoot, "package.json"), "utf8"));
const targets = new Set(["codex", "opencode", "devin"]);
const commonOptions = new Set(["--dry-run", "--force", "--json", "--models-file", "--backup-dir"]);
const targetOptions = {
  codex: new Set(["--codex-home"]),
  opencode: new Set(["--config-dir"]),
  devin: new Set(["--scope", "--destination-root"])
};
const valueOptions = new Set([
  "--target", "--scope", "--models-file", "--backup-dir", "--codex-home",
  "--config-dir", "--destination-root"
]);

try {
  const argv = process.argv.slice(2);
  if (argv.length === 0 || argv.includes("--help") || argv.includes("-h")) {
    process.stdout.write(usage());
  } else if (argv.length === 1 && (argv[0] === "--version" || argv[0] === "-V")) {
    process.stdout.write(`${manifest.version}\n`);
  } else {
    const { target, forwarded } = parseInstall(argv);
    const script = path.join(import.meta.dirname, `install-${target}.mjs`);
    const result = spawnSync(process.execPath, [script, ...forwarded], { stdio: "inherit" });
    if (result.error) throw result.error;
    process.exitCode = result.status ?? 1;
  }
} catch (error) {
  process.stderr.write(`Neres Agentic: ${error instanceof Error ? error.message : "unknown error"}\n`);
  process.exitCode = 1;
}

function parseInstall(argv) {
  if (argv[0] !== "install") throw new Error(`Unknown command: ${argv[0]}. Use "install" or --help.`);
  const rest = argv.slice(1);
  let target;
  if (rest[0] && !rest[0].startsWith("-")) target = rest.shift();

  const forwarded = [];
  let scope;
  for (let index = 0; index < rest.length; index += 1) {
    const option = rest[index];
    if (!option.startsWith("--")) throw new Error(`Unexpected argument: ${option}`);
    if (option === "--target") {
      const selected = requiredValue(rest, ++index, option);
      if (target && target !== selected) throw new Error(`Conflicting targets: ${target} and ${selected}.`);
      target = selected;
      continue;
    }
    const allowed = commonOptions.has(option) || Object.values(targetOptions).some((set) => set.has(option));
    if (!allowed) throw new Error(`Unknown option: ${option}`);
    const value = valueOptions.has(option) ? requiredValue(rest, ++index, option) : undefined;
    if (option === "--scope") scope = value;
    else {
      forwarded.push(option);
      if (value !== undefined) forwarded.push(value);
    }
  }

  if (!target) throw new Error("Install target is required: codex, opencode or devin.");
  if (!targets.has(target)) throw new Error(`Unsupported target: ${target}. Choose codex, opencode or devin.`);

  const incompatible = forwarded.find((option) =>
    option.startsWith("--") && !commonOptions.has(option) && !targetOptions[target].has(option)
  );
  if (incompatible) throw new Error(`${incompatible} is not supported for ${target}.`);
  if (scope !== undefined && target !== "devin") throw new Error("--scope is only supported for Devin.");
  if (target === "devin") {
    const selectedScope = scope ?? "project";
    if (!new Set(["project", "user"]).has(selectedScope)) {
      throw new Error("--scope must be project or user.");
    }
    forwarded.unshift("--target", selectedScope);
  }
  return { target, forwarded };
}

function requiredValue(argv, index, option) {
  if (!argv[index] || argv[index].startsWith("--")) throw new Error(`${option} requires a value.`);
  return argv[index];
}

function usage() {
  return `Neres Agentic BMAD ${manifest.version}\n\nUsage:\n  neres-agentic install <codex|opencode|devin> [options]\n  neres-agentic install --target <codex|opencode|devin> [options]\n\nQuick install with npx:\n  npx -y @mneresc/neres-agentic-bmad install codex\n  npx -y @mneresc/neres-agentic-bmad install opencode\n  npx -y @mneresc/neres-agentic-bmad install devin --scope project\n  npx -y @mneresc/neres-agentic-bmad install devin --scope user\n\nCommon options:\n  --dry-run                 Validate and preview without writing\n  --force                   Back up and replace managed destinations\n  --models-file <file>      Use a saved runtime model inventory\n  --backup-dir <directory>  Explicit backup root when using --force\n  --json                    Emit installer output as JSON\n\nTarget options:\n  Codex:    --codex-home <directory>\n  OpenCode: --config-dir <directory>\n  Devin:    --scope <project|user> --destination-root <directory>\n\nOther:\n  --version                 Print package version\n  --help                    Show this help\n`;
}
