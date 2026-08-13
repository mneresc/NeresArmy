import { access, copyFile, cp, mkdir, readdir, readFile, rm } from "node:fs/promises";
import path from "node:path";

export const DEVIN_ENTRY_SKILLS = ["neres-planner", "neres-developer", "neres-quick-dev", "neres-bug-doctor"];
export const DEVIN_PROTOCOL_SKILL = "neres-agentic-bmad";

export const EXPECTED_DEVIN_AGENTS = [
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

export const DEVIN_MODELS = {
  "plan-nerinhos-subagent-reader": "swe",
  "plan-nerinhos-subagent-writer": "swe",
  "plan-nerinhos-subagent-architect": "opus",
  "plan-nerinhos-subagent-critic": "swe",
  "dev-nerinhos-subagent-reader": "swe",
  "dev-nerinhos-subagent-mechanical": "swe",
  "dev-nerinhos-subagent-coder": "swe",
  "dev-nerinhos-subagent-test": "swe",
  "dev-nerinhos-subagent-qa": "swe",
  "dev-nerinhos-subagent-security": "opus",
  "dev-nerinhos-subagent-auditor": "opus"
};

const READ_ONLY_AGENTS = new Set([
  "plan-nerinhos-subagent-reader",
  "plan-nerinhos-subagent-architect",
  "plan-nerinhos-subagent-critic",
  "dev-nerinhos-subagent-reader",
  "dev-nerinhos-subagent-qa",
  "dev-nerinhos-subagent-security",
  "dev-nerinhos-subagent-auditor"
]);

const WRITE_AGENTS = new Set([
  "plan-nerinhos-subagent-writer",
  "dev-nerinhos-subagent-mechanical",
  "dev-nerinhos-subagent-coder"
]);

const REQUIRED_PROTOCOL_FILES = [
  "SKILL.md",
  "references/capabilities.md",
  "references/bug-doctor.md",
  "references/contracts.md",
  "references/development.md",
  "references/planning.md",
  "references/quick-dev.md",
  "references/routing.md"
];

export async function validateDevinBundle({ bundleRoot, modelIds }) {
  const diagnostics = [];
  const skillsRoot = path.join(bundleRoot, "assets", "devin", "skills");
  const agentsRoot = path.join(bundleRoot, "assets", "devin", "agents");
  const expectedSkills = [...DEVIN_ENTRY_SKILLS, DEVIN_PROTOCOL_SKILL];
  const skills = [];
  const agents = [];

  await validateExactDirectories(skillsRoot, expectedSkills, "Devin skills", diagnostics);
  await validateExactFiles(agentsRoot, EXPECTED_DEVIN_AGENTS, ".md", "Devin agents", diagnostics);

  for (const name of expectedSkills) {
    const source = await safeRead(path.join(skillsRoot, name, "SKILL.md"), diagnostics, name);
    if (!source) continue;
    const parsed = parseMarkdownSurface(source);
    skills.push({ name, ...parsed });
    if (parsed.name !== name) diagnostics.push(`${name}: skill name must match its directory.`);
    if (!parsed.description) diagnostics.push(`${name}: description is required.`);
    if (name !== DEVIN_PROTOCOL_SKILL && !parsed.triggers.includes("user")) {
      diagnostics.push(`${name}: entry skill must be user-triggerable.`);
    }
    if (!source.includes("CapabilityMap")) diagnostics.push(`${name}: must use CapabilityMap discovery.`);
    if (!/BMAD[\s\S]*?(?:if|when)[\s\S]*?available|if BMAD is available|available[\s\S]*?BMAD/i.test(source)) {
      diagnostics.push(`${name}: BMAD use must be conditional on discovery.`);
    }
  }

  for (const relative of REQUIRED_PROTOCOL_FILES) {
    if (!(await exists(path.join(skillsRoot, DEVIN_PROTOCOL_SKILL, relative)))) {
      diagnostics.push(`${DEVIN_PROTOCOL_SKILL}: missing ${relative}.`);
    }
  }

  for (const name of EXPECTED_DEVIN_AGENTS) {
    const source = await safeRead(path.join(agentsRoot, `${name}.md`), diagnostics, name);
    if (!source) continue;
    const parsed = parseMarkdownSurface(source);
    agents.push({ name, ...parsed });
    if (parsed.name !== name) diagnostics.push(`${name}: agent name must match its filename.`);
    if (!parsed.description) diagnostics.push(`${name}: description is required.`);
    if (parsed.model !== DEVIN_MODELS[name]) diagnostics.push(`${name}: model must be ${DEVIN_MODELS[name]}.`);
    if (!modelFamilyAvailable(parsed.model, modelIds)) {
      diagnostics.push(`${name}: model family ${parsed.model} is not available.`);
    }
    if (!parsed.allowedTools.includes("mcp__*")) diagnostics.push(`${name}: must allow discovered MCP tools.`);
    if (!source.includes("CapabilityMap")) diagnostics.push(`${name}: must consume a CapabilityMap.`);
    if (READ_ONLY_AGENTS.has(name)) {
      if (parsed.allowedTools.includes("edit") || parsed.allowedTools.includes("exec")) {
        diagnostics.push(`${name}: read-only role cannot allow edit or exec.`);
      }
      if (!/non-mutating MCP/i.test(source)) diagnostics.push(`${name}: must limit MCP use to non-mutating calls.`);
    }
    if (WRITE_AGENTS.has(name)) validateWriteAgent(name, source, parsed, diagnostics);
    if (name === "dev-nerinhos-subagent-test") {
      if (!parsed.allowedTools.includes("exec") || parsed.allowedTools.includes("edit")) {
        diagnostics.push(`${name}: test role must allow exec and deny edit by omission.`);
      }
    }
  }

  return { valid: diagnostics.length === 0, diagnostics, skills, agents };
}

export async function installDevinBundle({
  bundleRoot,
  target,
  destinationRoot,
  modelIds,
  dryRun = false,
  force = false,
  backupDirectory
}) {
  if (target !== "project" && target !== "user") throw new Error("target must be project or user.");
  const validation = await validateDevinBundle({ bundleRoot, modelIds });
  if (!validation.valid) throw new Error(validation.diagnostics.join("\n"));

  const sourceSkills = path.join(bundleRoot, "assets", "devin", "skills");
  const sourceAgents = path.join(bundleRoot, "assets", "devin", "agents");
  const base = target === "project" ? path.join(destinationRoot, ".agents") : destinationRoot;
  const destinations = [...DEVIN_ENTRY_SKILLS, DEVIN_PROTOCOL_SKILL].map((name) => ({
    source: path.join(sourceSkills, name),
    target: path.join(base, "skills", name),
    backupRelative: path.join("skills", name),
    directory: true
  }));
  for (const name of EXPECTED_DEVIN_AGENTS) {
    destinations.push({
      source: path.join(sourceAgents, `${name}.md`),
      target: path.join(base, "agents", `${name}.md`),
      backupRelative: path.join("agents", `${name}.md`),
      directory: false
    });
  }

  const conflicts = [];
  for (const item of destinations) if (await exists(item.target)) conflicts.push(item);
  if (conflicts.length > 0 && !force) {
    throw new Error(`Destination already exists: ${conflicts.map((item) => item.target).join(", ")}. Use --force to back up and replace it.`);
  }

  const defaultBackupRoot = target === "project"
    ? path.join(destinationRoot, ".agents", "backups")
    : path.join(destinationRoot, "backups");
  const resolvedBackup = conflicts.length > 0 && force
    ? path.resolve(backupDirectory ?? path.join(defaultBackupRoot, `neres-agentic-bmad-devin-${timestamp()}`))
    : null;
  if (dryRun) return { installed: destinations.map((item) => item.target), backupDirectory: resolvedBackup, dryRun: true };

  if (resolvedBackup) {
    for (const item of conflicts) {
      const backupTarget = path.join(resolvedBackup, item.backupRelative);
      await mkdir(path.dirname(backupTarget), { recursive: true });
      if (item.directory) await cp(item.target, backupTarget, { recursive: true, force: false });
      else await copyFile(item.target, backupTarget);
    }
    for (const item of conflicts) await rm(item.target, { recursive: item.directory, force: true });
  }

  await mkdir(path.join(base, "skills"), { recursive: true });
  await mkdir(path.join(base, "agents"), { recursive: true });
  for (const item of destinations) {
    if (item.directory) await cp(item.source, item.target, { recursive: true, force: true });
    else await copyFile(item.source, item.target);
  }
  return { installed: destinations.map((item) => item.target), backupDirectory: resolvedBackup, dryRun: false };
}

export function parseMarkdownSurface(source) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  const frontmatter = match?.[1] ?? "";
  return {
    name: scalar(frontmatter, "name"),
    description: scalar(frontmatter, "description"),
    model: scalar(frontmatter, "model"),
    triggers: list(frontmatter, "triggers"),
    allowedTools: list(frontmatter, "allowed-tools")
  };
}

function validateWriteAgent(name, source, parsed, diagnostics) {
  for (const tool of ["edit", "exec"]) {
    if (!parsed.allowedTools.includes(tool)) diagnostics.push(`${name}: write role must allow ${tool}.`);
  }
  for (const guard of ["commit", "push", "destructive", "secret"]) {
    if (!source.toLowerCase().includes(guard)) diagnostics.push(`${name}: must guard ${guard}.`);
  }
}

function modelFamilyAvailable(alias, modelIds = []) {
  if (!alias || modelIds.length === 0) return false;
  return modelIds.some((model) => String(model).toLowerCase().includes(alias.toLowerCase()));
}

async function validateExactDirectories(root, names, label, diagnostics) {
  let actual = [];
  try {
    actual = (await readdir(root, { withFileTypes: true })).filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort();
  } catch (error) {
    diagnostics.push(`${label}: cannot read directory (${message(error)}).`);
  }
  if (JSON.stringify(actual) !== JSON.stringify([...names].sort())) diagnostics.push(`${label} must contain exactly: ${[...names].sort().join(", ")}.`);
}

async function validateExactFiles(root, names, suffix, label, diagnostics) {
  let actual = [];
  try {
    actual = (await readdir(root, { withFileTypes: true })).filter((entry) => entry.isFile() && entry.name.endsWith(suffix)).map((entry) => entry.name.slice(0, -suffix.length)).sort();
  } catch (error) {
    diagnostics.push(`${label}: cannot read directory (${message(error)}).`);
  }
  if (JSON.stringify(actual) !== JSON.stringify([...names].sort())) diagnostics.push(`${label} must contain exactly: ${[...names].sort().join(", ")}.`);
}

async function safeRead(file, diagnostics, label) {
  try { return await readFile(file, "utf8"); }
  catch (error) { diagnostics.push(`${label}: cannot read ${file} (${message(error)}).`); return null; }
}

function scalar(frontmatter, key) {
  const match = frontmatter.match(new RegExp(`^${escapeRegex(key)}:[ \\t]*(.+?)[ \\t]*$`, "m"));
  return match?.[1]?.replace(/^['"]|['"]$/g, "");
}

function list(frontmatter, key) {
  const inline = scalar(frontmatter, key);
  if (inline?.startsWith("[") && inline.endsWith("]")) {
    return inline.slice(1, -1).split(",").map((item) => item.trim().replace(/^['"]|['"]$/g, "")).filter(Boolean);
  }
  const lines = frontmatter.split(/\r?\n/);
  const start = lines.findIndex((line) => line.trim() === `${key}:`);
  if (start < 0) return [];
  const result = [];
  for (let index = start + 1; index < lines.length; index += 1) {
    const match = lines[index].match(/^\s+-\s+(.+?)\s*$/);
    if (!match) break;
    result.push(match[1].replace(/^['"]|['"]$/g, ""));
  }
  return result;
}

async function exists(target) {
  try { await access(target); return true; }
  catch { return false; }
}

function timestamp() { return new Date().toISOString().replaceAll(/[-:.]/g, "").replace("Z", "Z"); }
function message(error) { return error instanceof Error ? error.message : "unknown error"; }
function escapeRegex(value) { return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }
