import { access, copyFile, cp, mkdir, readdir, readFile, rm } from "node:fs/promises";
import path from "node:path";

export const CODEX_PROFILES = ["neres-planner", "neres-developer", "neres-quick-dev", "neres-bug-doctor"];

export const EXPECTED_CODEX_AGENTS = [
  "plan-nerinhos-subagent-reader",
  "plan-nerinhos-subagent-writer",
  "plan-nerinhos-subagent-architect",
  "plan-nerinhos-subagent-critic",
  "dev-nerinhos-subagent-reader",
  "dev-nerinhos-subagent-mechanical",
  "dev-nerinhos-subagent-coder",
  "dev-nerinhos-subagent-test",
  "dev-nerinhos-subagent-qa",
  "dev-nerinhos-subagent-security",
  "dev-nerinhos-subagent-auditor"
];

export const CODEX_AGENT_MODELS = {
  "plan-nerinhos-subagent-reader": route("gpt-5.6-luna", "low", "read-only"),
  "plan-nerinhos-subagent-writer": route("gpt-5.6-terra", "low", "workspace-write"),
  "plan-nerinhos-subagent-architect": route("gpt-5.6-sol", "high", "read-only"),
  "plan-nerinhos-subagent-critic": route("gpt-5.6-terra", "medium", "read-only"),
  "dev-nerinhos-subagent-reader": route("gpt-5.6-luna", "low", "read-only"),
  "dev-nerinhos-subagent-mechanical": route("gpt-5.6-luna", "low", "workspace-write"),
  "dev-nerinhos-subagent-coder": route("gpt-5.6-terra", "medium", "workspace-write"),
  "dev-nerinhos-subagent-test": route("gpt-5.6-luna", "low", "workspace-write"),
  "dev-nerinhos-subagent-qa": route("gpt-5.6-terra", "medium", "read-only"),
  "dev-nerinhos-subagent-security": route("gpt-5.6-terra", "high", "read-only"),
  "dev-nerinhos-subagent-auditor": route("gpt-5.6-terra", "medium", "read-only")
};

const PROFILE_ROUTES = {
  "neres-planner": route("gpt-5.6-terra", "medium", "read-only"),
  "neres-developer": route("gpt-5.6-terra", "medium", "workspace-write"),
  "neres-quick-dev": route("gpt-5.6-terra", "low", "workspace-write"),
  "neres-bug-doctor": route("gpt-5.6-terra", "medium", "read-only")
};

export async function validateCodexBundle({ bundleRoot, modelIds }) {
  const diagnostics = [];
  const availableModels = new Set(modelIds ?? []);
  const agentRoot = path.join(bundleRoot, "assets", "codex", "agents");
  const profileRoot = path.join(bundleRoot, "assets", "codex", "profiles");
  const agents = [];
  const profiles = [];

  await validateExactFiles(agentRoot, EXPECTED_CODEX_AGENTS, ".toml", "Codex agents", diagnostics);
  await validateExactFiles(profileRoot, CODEX_PROFILES, ".config.toml", "Codex profiles", diagnostics);

  for (const name of EXPECTED_CODEX_AGENTS) {
    const source = await safeRead(path.join(agentRoot, `${name}.toml`), diagnostics, name);
    if (!source) continue;
    const parsed = parseTomlSurface(source);
    agents.push({ filename: name, ...parsed });
    validateCommonSurface({ name, source, parsed, expected: CODEX_AGENT_MODELS[name], availableModels, diagnostics });
    if (parsed.name !== name) diagnostics.push(`${name}: name field must match the filename.`);
    if (!parsed.description) diagnostics.push(`${name}: description is required.`);
    if (!parsed.developerInstructions) diagnostics.push(`${name}: developer_instructions is required.`);
    if (!source.includes("$neres-agentic-bmad")) diagnostics.push(`${name}: must load $neres-agentic-bmad.`);
    if (parsed.sandboxMode === "workspace-write") {
      for (const guard of ["commit", "push"]) {
        if (!parsed.developerInstructions.toLowerCase().includes(guard)) {
          diagnostics.push(`${name}: write agent must explicitly forbid ${guard}.`);
        }
      }
    }
  }

  for (const name of CODEX_PROFILES) {
    const source = await safeRead(path.join(profileRoot, `${name}.config.toml`), diagnostics, name);
    if (!source) continue;
    const parsed = parseTomlSurface(source);
    profiles.push({ name, ...parsed });
    validateCommonSurface({ name, source, parsed, expected: PROFILE_ROUTES[name], availableModels, diagnostics });
    if (parsed.approvalPolicy !== "on-request") diagnostics.push(`${name}: approval_policy must be on-request.`);
    if (parsed.maxThreads !== 6) diagnostics.push(`${name}: max_concurrent_threads_per_session must be 6.`);
    if (!parsed.developerInstructions?.includes("$neres-agentic-bmad")) {
      diagnostics.push(`${name}: profile must load $neres-agentic-bmad.`);
    }
  }

  const skill = await safeRead(path.join(bundleRoot, "SKILL.md"), diagnostics, "neres-agentic-bmad");
  if (skill && !/^name:\s*neres-agentic-bmad\s*$/m.test(skill)) {
    diagnostics.push("SKILL.md name must be neres-agentic-bmad.");
  }

  return { valid: diagnostics.length === 0, diagnostics, agents, profiles };
}

export async function installCodexBundle({
  bundleRoot,
  codexHome,
  modelIds,
  dryRun = false,
  force = false,
  backupDirectory
}) {
  const validation = await validateCodexBundle({ bundleRoot, modelIds });
  if (!validation.valid) throw new Error(validation.diagnostics.join("\n"));

  const destinations = EXPECTED_CODEX_AGENTS.map((name) => ({
    source: path.join(bundleRoot, "assets", "codex", "agents", `${name}.toml`),
    target: path.join(codexHome, "agents", `${name}.toml`),
    backupRelative: path.join("agents", `${name}.toml`),
    directory: false
  }));
  for (const name of CODEX_PROFILES) {
    destinations.push({
      source: path.join(bundleRoot, "assets", "codex", "profiles", `${name}.config.toml`),
      target: path.join(codexHome, `${name}.config.toml`),
      backupRelative: `${name}.config.toml`,
      directory: false
    });
  }
  const skillTarget = path.join(codexHome, "skills", "neres-agentic-bmad");
  if (!samePath(bundleRoot, skillTarget)) {
    destinations.push({
      source: bundleRoot,
      target: skillTarget,
      backupRelative: path.join("skills", "neres-agentic-bmad"),
      directory: true
    });
  }

  const conflicts = [];
  for (const item of destinations) if (await exists(item.target)) conflicts.push(item);
  if (conflicts.length > 0 && !force) {
    throw new Error(`Destination already exists: ${conflicts.map((item) => item.target).join(", ")}. Use --force to back up and replace it.`);
  }

  const resolvedBackup = conflicts.length > 0 && force
    ? path.resolve(backupDirectory ?? path.join(codexHome, "backups", `neres-agentic-bmad-codex-${timestamp()}`))
    : null;
  if (dryRun) {
    return { installed: destinations.map((item) => item.target), backupDirectory: resolvedBackup, dryRun: true };
  }

  if (resolvedBackup) {
    for (const item of conflicts) {
      const backupTarget = path.join(resolvedBackup, item.backupRelative);
      await mkdir(path.dirname(backupTarget), { recursive: true });
      if (item.directory) await cp(item.target, backupTarget, { recursive: true, force: false });
      else await copyFile(item.target, backupTarget);
    }
    for (const item of conflicts) await rm(item.target, { recursive: item.directory, force: true });
  }

  await mkdir(path.join(codexHome, "agents"), { recursive: true });
  await mkdir(path.join(codexHome, "skills"), { recursive: true });
  for (const item of destinations) {
    if (item.directory) await cp(item.source, item.target, { recursive: true, force: true });
    else await copyFile(item.source, item.target);
  }

  return { installed: destinations.map((item) => item.target), backupDirectory: resolvedBackup, dryRun: false };
}

export function parseTomlSurface(source) {
  return {
    name: scalar(source, "name"),
    description: scalar(source, "description"),
    model: scalar(source, "model"),
    reasoningEffort: scalar(source, "model_reasoning_effort"),
    sandboxMode: scalar(source, "sandbox_mode"),
    approvalPolicy: scalar(source, "approval_policy"),
    developerInstructions: multiline(source, "developer_instructions"),
    maxThreads: integerInSection(source, "agents", "max_concurrent_threads_per_session")
  };
}

function validateCommonSurface({ name, parsed, expected, availableModels, diagnostics }) {
  if (parsed.model !== expected.model) diagnostics.push(`${name}: model must be ${expected.model}.`);
  if (parsed.reasoningEffort !== expected.reasoningEffort) {
    diagnostics.push(`${name}: model_reasoning_effort must be ${expected.reasoningEffort}.`);
  }
  if (parsed.sandboxMode !== expected.sandboxMode) {
    diagnostics.push(`${name}: sandbox_mode must be ${expected.sandboxMode}.`);
  }
  if (parsed.model && availableModels.size > 0 && !availableModels.has(parsed.model)) {
    diagnostics.push(`${name}: model ${parsed.model} is not available.`);
  }
}

async function validateExactFiles(root, names, suffix, label, diagnostics) {
  let actual = [];
  try {
    actual = (await readdir(root, { withFileTypes: true }))
      .filter((entry) => entry.isFile() && entry.name.endsWith(suffix))
      .map((entry) => entry.name.slice(0, -suffix.length))
      .sort();
  } catch (error) {
    diagnostics.push(`${label}: cannot read directory (${message(error)}).`);
  }
  const expected = [...names].sort();
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    diagnostics.push(`${label} must contain exactly: ${expected.join(", ")}.`);
  }
}

async function safeRead(file, diagnostics, label) {
  try {
    return await readFile(file, "utf8");
  } catch (error) {
    diagnostics.push(`${label}: cannot read ${file} (${message(error)}).`);
    return null;
  }
}

function scalar(source, key) {
  const match = source.match(new RegExp(`^${escapeRegex(key)}\\s*=\\s*"([^"]*)"\\s*$`, "m"));
  return match?.[1];
}

function multiline(source, key) {
  const match = source.match(new RegExp(`^${escapeRegex(key)}\\s*=\\s*('''|\\"\\"\\")([\\s\\S]*?)\\1\\s*$`, "m"));
  return match?.[2]?.trim();
}

function integerInSection(source, section, key) {
  const lines = source.split(/\r?\n/);
  const start = lines.findIndex((line) => line.trim() === `[${section}]`);
  const block = start < 0
    ? ""
    : lines.slice(start + 1, nextSection(lines, start + 1)).join("\n");
  const match = block.match(new RegExp(`^${escapeRegex(key)}\\s*=\\s*(\\d+)\\s*$`, "m"));
  return match ? Number.parseInt(match[1], 10) : Number.NaN;
}

function nextSection(lines, start) {
  const offset = lines.slice(start).findIndex((line) => /^\s*\[/.test(line));
  return offset < 0 ? lines.length : start + offset;
}

function route(model, reasoningEffort, sandboxMode) {
  return { model, reasoningEffort, sandboxMode };
}

async function exists(target) {
  try {
    await access(target);
    return true;
  } catch {
    return false;
  }
}

function samePath(left, right) {
  return path.resolve(left).toLowerCase() === path.resolve(right).toLowerCase();
}

function timestamp() {
  return new Date().toISOString().replaceAll(/[-:.]/g, "").replace("Z", "Z");
}

function message(error) {
  return error instanceof Error ? error.message : "unknown error";
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
