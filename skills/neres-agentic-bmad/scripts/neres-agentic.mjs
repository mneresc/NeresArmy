#!/usr/bin/env node

import { readFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import { spawnSync } from "node:child_process";
import { createInterface } from "node:readline/promises";

const packageRoot = path.resolve(import.meta.dirname, "..");
const manifest = JSON.parse(readFileSync(path.join(packageRoot, "package.json"), "utf8"));
const targetOrder = ["codex", "opencode", "devin", "claude-code"];
const aliases = new Map([["claude", "claude-code"], ["claude-code", "claude-code"]]);
const commonOptions = new Set(["--dry-run", "--force", "--json", "--backup-dir", "--project-root", "--language", "--skip-bmad"]);
const targetOptions = {
  codex: new Set(["--codex-home", "--models-file"]),
  opencode: new Set(["--config-dir", "--models-file"]),
  devin: new Set(["--scope", "--destination-root", "--models-file"]),
  "claude-code": new Set(["--scope", "--destination-root"])
};
const valueOptions = new Set(["--target", "--targets", "--scope", "--models-file", "--backup-dir", "--project-root", "--language", "--codex-home", "--config-dir", "--destination-root"]);

try {
  const argv = process.argv.slice(2);
  if (argv.includes("--help") || argv.includes("-h")) process.stdout.write(usage());
  else if (argv.length === 1 && (argv[0] === "--version" || argv[0] === "-V")) process.stdout.write(`${manifest.version}\n`);
  else {
    const request = await parseInstall(argv);
    if (request.targets.length > 1 && !request.forwarded.includes("--dry-run")) {
      for (const target of request.targets) dispatch(target, [...request.forwarded, "--dry-run"], request.scopes[target]);
    }
    for (const target of request.targets) dispatch(target, request.forwarded, request.scopes[target]);
  }
} catch (error) {
  process.stderr.write(`Neres Agentic: ${error instanceof Error ? error.message : "unknown error"}\n`);
  process.exitCode = 1;
}

async function parseInstall(argv) {
  if (argv.length && argv[0] !== "install") throw new Error(`Unknown command: ${argv[0]}. Use "install" or --help.`);
  const rest = argv[0] === "install" ? argv.slice(1) : [...argv];
  let targets = [];
  if (rest[0] && !rest[0].startsWith("-")) targets = [normalize(rest.shift())];
  const forwarded = [];
  let scope;
  let language;
  for (let index = 0; index < rest.length; index += 1) {
    const option = rest[index];
    if (!option.startsWith("--")) throw new Error(`Unexpected argument: ${option}`);
    const value = valueOptions.has(option) ? requiredValue(rest, ++index, option) : undefined;
    if (option === "--target") targets = [normalize(value)];
    else if (option === "--targets") targets = value.split(",").map(normalize);
    else if (option === "--scope") scope = value;
    else if (option === "--language") { language = value; forwarded.push(option, value); }
    else {
      const known = commonOptions.has(option) || Object.values(targetOptions).some((set) => set.has(option));
      if (!known) throw new Error(`Unknown option: ${option}`);
      forwarded.push(option);
      if (value !== undefined) forwarded.push(value);
    }
  }

  const scopes = {};
  if (!targets.length) {
    const selected = await interactiveSelection();
    targets = selected.targets;
    Object.assign(scopes, selected.scopes);
    if (!language) forwarded.push("--language", selected.language);
  }
  targets = [...new Set(targets)];
  if (!targets.length) throw new Error("At least one installation target is required.");
  for (const target of targets) if (!targetOrder.includes(target)) throw new Error(`Unsupported target: ${target}.`);
  if (scope) {
    if (targets.length !== 1 || !new Set(["devin", "claude-code"]).has(targets[0])) throw new Error("--scope is only supported for a single Devin or Claude Code target.");
    scopes[targets[0]] = scope;
  }
  for (const target of targets) {
    const incompatible = forwarded.find((option) => option.startsWith("--") && !commonOptions.has(option) && !targetOptions[target].has(option));
    if (incompatible) throw new Error(`${incompatible} is not supported for ${target}.`);
  }
  return { targets, forwarded, scopes };
}

async function interactiveSelection() {
  const prompt = await createPrompter();
  try {
    process.stdout.write("\nNeres Agentic BMAD / Instalador / Installer / Instalador\n\n");
    targetOrder.forEach((target, index) => process.stdout.write(`  [${index + 1}] ${label(target)}\n`));
    process.stdout.write("  [a] Todos / All / Todos\n\n");
    const answer = (await prompt.ask("Selecione destinos (ex.: 1,4) / Select targets / Seleccione destinos: ")).trim().toLowerCase();
    const targets = answer === "a" || answer === "all"
      ? [...targetOrder]
      : answer.split(",").map((value) => Number.parseInt(value.trim(), 10)).filter((value) => value >= 1 && value <= targetOrder.length).map((value) => targetOrder[value - 1]);
    if (!targets.length) throw new Error("No valid target selected.");
    const scopes = {};
    for (const target of targets.filter((item) => item === "devin" || item === "claude-code")) {
      const selected = (await prompt.ask(`${label(target)}: [1] projeto/project/proyecto  [2] usuário/user/usuario (1): `)).trim();
      scopes[target] = selected === "2" ? "user" : "project";
    }
    const selectedLanguage = (await prompt.ask("Idioma BMAD / BMAD language: [1] Português [2] English [3] Español (1): ")).trim();
    return { targets, scopes, language: ({ "2": "en", "3": "es" })[selectedLanguage] ?? "pt" };
  } finally { prompt.close(); }
}

async function createPrompter() {
  if (process.stdin.isTTY) {
    const rl = createInterface({ input: process.stdin, output: process.stdout });
    return { ask: (question) => rl.question(question), close: () => rl.close() };
  }
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  const answers = Buffer.concat(chunks.map((chunk) => Buffer.from(chunk))).toString("utf8").split(/\r?\n/);
  return {
    ask(question) { process.stdout.write(question); return Promise.resolve(answers.shift() ?? ""); },
    close() {}
  };
}

function dispatch(target, forwarded, scope) {
  const scriptName = target === "claude-code" ? "install-claude.mjs" : `install-${target}.mjs`;
  const args = [...forwarded];
  if (target === "devin" || target === "claude-code") args.unshift("--target", scope ?? "project");
  const result = spawnSync(process.execPath, [path.join(import.meta.dirname, scriptName), ...args], { stdio: "inherit" });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${label(target)} installer failed with exit code ${result.status ?? 1}.`);
}

function normalize(target) { return aliases.get(String(target).toLowerCase()) ?? String(target).toLowerCase(); }
function requiredValue(argv, index, option) { if (!argv[index] || argv[index].startsWith("--")) throw new Error(`${option} requires a value.`); return argv[index]; }
function label(target) { return ({ codex: "Codex", opencode: "OpenCode", devin: "Devin", "claude-code": "Claude Code" })[target]; }

function usage() {
  return `Neres Agentic BMAD ${manifest.version}\n\nUsage:\n  neres-agentic                         Interactive multi-target installer\n  neres-agentic install <target> [options]\n  neres-agentic install --targets codex,claude-code [options]\n\nTargets:\n  codex | opencode | devin | claude-code\n\nQuick install with npx:\n  npx -y @mneresc/neres-agentic-bmad\n  npx -y @mneresc/neres-agentic-bmad install claude-code --scope project\n\nCommon options:\n  --project-root <directory> Project receiving bundled BMAD (default: current)\n  --language <pt|en|es>      BMAD document language\n  --skip-bmad                Install only Neres assets\n  --dry-run                  Validate and preview without writing\n  --force                    Back up and replace managed Neres destinations\n  --models-file <file>       Use a saved runtime model inventory\n  --backup-dir <directory>   Explicit backup root when using --force\n  --json                     Emit installer output as JSON\n\nTarget options:\n  Codex:       --codex-home <directory>\n  OpenCode:    --config-dir <directory>\n  Devin:       --scope <project|user> --destination-root <directory>\n  Claude Code: --scope <project|user> --destination-root <directory>\n`;
}
