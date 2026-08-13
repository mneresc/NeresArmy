import { access, copyFile, cp, mkdir, readdir, readFile, rm } from "node:fs/promises";
import path from "node:path";

export const EXPECTED_AGENTS = [
  "neres-planner",
  "neres-developer",
  "neres-quick-dev",
  "neres-bug-doctor",
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

export const PRIMARY_TASK_ALLOWLIST = {
  "neres-planner": [
    "plan-nerinhos-subagent-reader",
    "plan-nerinhos-subagent-writer",
    "plan-nerinhos-subagent-architect",
    "plan-nerinhos-subagent-critic"
  ],
  "neres-developer": [
    "dev-nerinhos-subagent-reader",
    "dev-nerinhos-subagent-mechanical",
    "dev-nerinhos-subagent-coder",
    "dev-nerinhos-subagent-test",
    "dev-nerinhos-subagent-qa",
    "dev-nerinhos-subagent-security",
    "dev-nerinhos-subagent-auditor"
  ],
  "neres-quick-dev": [
    "dev-nerinhos-subagent-reader",
    "dev-nerinhos-subagent-mechanical",
    "dev-nerinhos-subagent-coder",
    "dev-nerinhos-subagent-test",
    "dev-nerinhos-subagent-qa",
    "dev-nerinhos-subagent-security",
    "dev-nerinhos-subagent-auditor"
  ],
  "neres-bug-doctor": [
    "dev-nerinhos-subagent-reader",
    "dev-nerinhos-subagent-test",
    "dev-nerinhos-subagent-qa"
  ]
};

export const EXPECTED_MODELS = {
  "neres-planner": "opencode-go/deepseek-v4-pro",
  "neres-developer": "opencode-go/deepseek-v4-pro",
  "neres-quick-dev": "opencode-go/deepseek-v4-pro",
  "neres-bug-doctor": "opencode-go/glm-5.2",
  "plan-nerinhos-subagent-reader": "opencode-go/deepseek-v4-flash",
  "plan-nerinhos-subagent-writer": "opencode-go/glm-5.2",
  "plan-nerinhos-subagent-architect": "opencode-go/glm-5.2",
  "plan-nerinhos-subagent-critic": "opencode-go/deepseek-v4-pro",
  "dev-nerinhos-subagent-reader": "opencode-go/deepseek-v4-flash",
  "dev-nerinhos-subagent-mechanical": "opencode-go/deepseek-v4-flash",
  "dev-nerinhos-subagent-coder": "opencode-go/kimi-k2.7-code",
  "dev-nerinhos-subagent-test": "opencode-go/deepseek-v4-flash",
  "dev-nerinhos-subagent-qa": "opencode-go/deepseek-v4-pro",
  "dev-nerinhos-subagent-security": "opencode-go/deepseek-v4-pro",
  "dev-nerinhos-subagent-auditor": "opencode-go/glm-5.2"
};

const READ_ONLY_AGENTS = new Set([
  "neres-bug-doctor",
  "plan-nerinhos-subagent-reader",
  "plan-nerinhos-subagent-architect",
  "plan-nerinhos-subagent-critic",
  "dev-nerinhos-subagent-reader",
  "dev-nerinhos-subagent-test",
  "dev-nerinhos-subagent-qa",
  "dev-nerinhos-subagent-security",
  "dev-nerinhos-subagent-auditor"
]);

const WRITE_AGENTS = new Set([
  "neres-developer",
  "neres-quick-dev",
  "dev-nerinhos-subagent-mechanical",
  "dev-nerinhos-subagent-coder"
]);

const REQUIRED_PROTOCOL_FILES = [
  "SKILL.md",
  "references/capabilities.md",
  "references/bug-doctor.md",
  "references/contracts.md",
  "references/planning.md",
  "references/development.md",
  "references/routing.md",
  "references/security.md",
  "references/observability.md",
  "references/quick-dev.md",
  "templates/run-log-entry.json"
];

export async function validateBundle({ bundleRoot, modelIds }) {
  const diagnostics = [];
  const agentRoot = path.join(bundleRoot, "assets", "opencode", "agents");
  const protocolRoot = path.join(bundleRoot, "assets", "opencode", "skills", "agentic-bmad");
  const availableModels = new Set(modelIds ?? []);
  const agents = [];

  let actualAgents = [];
  try {
    actualAgents = (await readdir(agentRoot, { withFileTypes: true }))
      .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
      .map((entry) => entry.name.slice(0, -3))
      .sort();
  } catch (error) {
    diagnostics.push(`Cannot read agent bundle: ${message(error)}.`);
  }

  const expectedSorted = [...EXPECTED_AGENTS].sort();
  if (JSON.stringify(actualAgents) !== JSON.stringify(expectedSorted)) {
    diagnostics.push(`Agent bundle must contain exactly: ${expectedSorted.join(", ")}.`);
  }

  for (const name of EXPECTED_AGENTS) {
    const file = path.join(agentRoot, `${name}.md`);
    let source;
    try {
      source = await readFile(file, "utf8");
    } catch (error) {
      diagnostics.push(`${name}: cannot read agent (${message(error)}).`);
      continue;
    }
    const metadata = parseAgent(source);
    agents.push({ name, ...metadata });

    if (!metadata.description) diagnostics.push(`${name}: description is required.`);
    const expectedMode = name.startsWith("neres-") ? "primary" : "subagent";
    if (metadata.mode !== expectedMode) diagnostics.push(`${name}: mode must be ${expectedMode}.`);
    if (expectedMode === "subagent" && metadata.hidden !== true) {
      diagnostics.push(`${name}: subagent must be hidden.`);
    }
    if (!Number.isInteger(metadata.steps) || metadata.steps < 1 || metadata.steps > 40) {
      diagnostics.push(`${name}: steps must be an integer from 1 to 40.`);
    }
    if (!metadata.model) diagnostics.push(`${name}: model is required.`);
    else if (availableModels.size > 0 && !availableModels.has(metadata.model)) {
      diagnostics.push(`${name}: model ${metadata.model} is not available.`);
    }
    if (metadata.model && metadata.model !== EXPECTED_MODELS[name]) {
      diagnostics.push(`${name}: model must be ${EXPECTED_MODELS[name]}.`);
    }
    if (!source.includes("agentic-bmad")) diagnostics.push(`${name}: must load the agentic-bmad protocol.`);
    requireText(
      source,
      '"~/.config/opencode/skills/agentic-bmad/**": allow',
      diagnostics,
      `${name}: must allow progressive references from the installed protocol`
    );

    const expectedTasks = PRIMARY_TASK_ALLOWLIST[name] ?? [];
    const allowedTasks = Object.entries(metadata.taskPermissions)
      .filter(([, effect]) => effect === "allow")
      .map(([task]) => task);
    if (JSON.stringify(allowedTasks) !== JSON.stringify(expectedTasks)) {
      diagnostics.push(`${name}: task allowlist differs from the contract.`);
    }
    if (metadata.taskPermissions["*"] !== "deny") {
      diagnostics.push(`${name}: task permissions must deny wildcard access.`);
    }

    if (READ_ONLY_AGENTS.has(name) && metadata.editPermission !== "deny") {
      diagnostics.push(`${name}: read-only agent must deny edit.`);
    }
    if (name === "neres-planner") {
      requireText(source, '"*": deny', diagnostics, `${name}: edit must deny by default`);
      requireText(source, '"**/_bmad-output/**": allow', diagnostics, `${name}: must allow BMAD output edits`);
    }
    if (WRITE_AGENTS.has(name)) validateWriteAgent(name, source, diagnostics);
  }

  for (const relative of REQUIRED_PROTOCOL_FILES) {
    if (!(await exists(path.join(protocolRoot, relative)))) {
      diagnostics.push(`agentic-bmad: missing ${relative}.`);
    }
  }
  if (await exists(path.join(protocolRoot, "SKILL.md"))) {
    const skill = await readFile(path.join(protocolRoot, "SKILL.md"), "utf8");
    if (!/^name:\s*agentic-bmad\s*$/m.test(skill)) {
      diagnostics.push("agentic-bmad: SKILL.md name must be agentic-bmad.");
    }
  }

  return {
    valid: diagnostics.length === 0,
    diagnostics,
    agents,
    primaryTaskAllowlist: structuredClone(PRIMARY_TASK_ALLOWLIST)
  };
}

export async function installBundle({
  bundleRoot,
  configDir,
  modelIds,
  dryRun = false,
  force = false,
  backupDirectory
}) {
  const validation = await validateBundle({ bundleRoot, modelIds });
  if (!validation.valid) throw new Error(validation.diagnostics.join("\n"));

  const sourceAgents = path.join(bundleRoot, "assets", "opencode", "agents");
  const sourceProtocol = path.join(bundleRoot, "assets", "opencode", "skills", "agentic-bmad");
  const destinations = EXPECTED_AGENTS.map((name) => ({
    source: path.join(sourceAgents, `${name}.md`),
    target: path.join(configDir, "agents", `${name}.md`),
    backupRelative: path.join("agents", `${name}.md`),
    directory: false
  }));
  destinations.push({
    source: sourceProtocol,
    target: path.join(configDir, "skills", "agentic-bmad"),
    backupRelative: path.join("skills", "agentic-bmad"),
    directory: true
  });

  const conflicts = [];
  for (const item of destinations) if (await exists(item.target)) conflicts.push(item);
  if (conflicts.length > 0 && !force) {
    throw new Error(`Destination already exists: ${conflicts.map((item) => item.target).join(", ")}. Use --force to back up and replace it.`);
  }

  const resolvedBackup = conflicts.length > 0 && force
    ? path.resolve(backupDirectory ?? path.join(configDir, "backups", `neres-agentic-bmad-${timestamp()}`))
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
    for (const item of conflicts) {
      await rm(item.target, { recursive: item.directory, force: true });
    }
  }

  await mkdir(path.join(configDir, "agents"), { recursive: true });
  await mkdir(path.join(configDir, "skills"), { recursive: true });
  for (const item of destinations) {
    if (item.directory) await cp(item.source, item.target, { recursive: true, force: true });
    else await copyFile(item.source, item.target);
  }

  return { installed: destinations.map((item) => item.target), backupDirectory: resolvedBackup, dryRun: false };
}

export function parseAgent(source) {
  const frontmatterMatch = source.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  const frontmatter = frontmatterMatch?.[1] ?? "";
  return {
    description: scalar(frontmatter, "description"),
    mode: scalar(frontmatter, "mode"),
    model: scalar(frontmatter, "model"),
    hidden: scalar(frontmatter, "hidden") === "true",
    steps: Number.parseInt(scalar(frontmatter, "steps") ?? "", 10),
    editPermission: nestedScalar(frontmatter, "permission", "edit"),
    taskPermissions: nestedMap(frontmatter, "permission", "task")
  };
}

function validateWriteAgent(name, source, diagnostics) {
  for (const required of [
    '"git commit*": deny',
    '"git push*": deny',
    '"rm *": deny',
    '"Remove-Item *": deny',
    '"*.env": deny',
    '"*.env.*": deny'
  ]) {
    requireText(source, required, diagnostics, `${name}: missing protection ${required}`);
  }
}

function scalar(frontmatter, key) {
  const match = frontmatter.match(new RegExp(`^${escapeRegex(key)}:[ \\t]*(.+?)[ \\t]*$`, "m"));
  return match?.[1]?.replace(/^['"]|['"]$/g, "");
}

function nestedScalar(frontmatter, parent, key) {
  const block = childBlock(frontmatter, parent, 0);
  const match = block.match(new RegExp(`^  ${escapeRegex(key)}:[ \\t]*(.+?)[ \\t]*$`, "m"));
  return match?.[1]?.replace(/^['"]|['"]$/g, "");
}

function nestedMap(frontmatter, parent, key) {
  const parentBlock = childBlock(frontmatter, parent, 0);
  const block = childBlock(parentBlock, key, 2);
  const result = {};
  for (const line of block.split(/\r?\n/)) {
    const match = line.match(/^\s{4}(?:"([^"]+)"|([^:]+)):\s*(allow|ask|deny)\s*$/);
    if (match) result[(match[1] ?? match[2]).trim()] = match[3];
  }
  return result;
}

function childBlock(source, key, indent) {
  const lines = source.split(/\r?\n/);
  const prefix = `${" ".repeat(indent)}${key}:`;
  const start = lines.findIndex((line) => line === prefix);
  if (start < 0) return "";
  const result = [];
  for (let index = start + 1; index < lines.length; index += 1) {
    const line = lines[index];
    if (line.trim() && line.length - line.trimStart().length <= indent) break;
    result.push(line);
  }
  return result.join("\n");
}

function requireText(source, text, diagnostics, diagnostic) {
  if (!source.includes(text)) diagnostics.push(`${diagnostic}.`);
}

async function exists(target) {
  try {
    await access(target);
    return true;
  } catch {
    return false;
  }
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
