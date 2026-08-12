import { access, copyFile, cp, mkdir, readdir, readFile, rm } from "node:fs/promises";
import path from "node:path";

export const CLAUDE_ENTRY_AGENTS = ["neres-planner", "neres-developer", "neres-quick-dev"];
export const CLAUDE_SUBAGENTS = [
  "plan-nerinhos-subagent-reader", "plan-nerinhos-subagent-writer", "plan-nerinhos-subagent-architect", "plan-nerinhos-subagent-critic",
  "dev-nerinhos-subagent-reader", "dev-nerinhos-subagent-mechanical", "dev-nerinhos-subagent-coder", "dev-nerinhos-subagent-test",
  "dev-nerinhos-subagent-qa", "dev-nerinhos-subagent-security", "dev-nerinhos-subagent-auditor"
];
export const CLAUDE_AGENTS = [...CLAUDE_ENTRY_AGENTS, ...CLAUDE_SUBAGENTS];

export async function validateClaudeBundle({ bundleRoot }) {
  const diagnostics = [];
  const agentsRoot = path.join(bundleRoot, "assets", "claude", "agents");
  const actual = await names(agentsRoot, diagnostics);
  if (JSON.stringify(actual) !== JSON.stringify([...CLAUDE_AGENTS].sort())) diagnostics.push("Claude agent bundle differs from the exact contract.");
  const entryAgents = [];
  for (const name of CLAUDE_AGENTS) {
    const source = await safeRead(path.join(agentsRoot, `${name}.md`), diagnostics, name);
    if (!source) continue;
    const parsed = parse(source);
    if (parsed.name !== name) diagnostics.push(`${name}: frontmatter name must match filename.`);
    if (!parsed.description || !parsed.tools || !parsed.model) diagnostics.push(`${name}: description, tools and model are required.`);
    if (CLAUDE_ENTRY_AGENTS.includes(name)) {
      entryAgents.push(name);
      if (name !== "neres-quick-dev" && !parsed.tools.includes("Agent(")) diagnostics.push(`${name}: entry agent must restrict delegated agents.`);
    } else if (parsed.tools.includes("Agent")) diagnostics.push(`${name}: subagent cannot delegate.`);
    if (!source.includes("CapabilityMap") && !source.includes("TaskPacket")) diagnostics.push(`${name}: must consume capability or task contracts.`);
  }
  const skill = path.join(bundleRoot, "assets", "claude", "skills", "neres-agentic-bmad", "SKILL.md");
  if (!(await exists(skill))) diagnostics.push("Claude protocol skill is missing.");
  return { valid: diagnostics.length === 0, diagnostics, entryAgents };
}

export async function installClaudeBundle({ bundleRoot, target = "project", destinationRoot, dryRun = false, force = false, backupDirectory }) {
  if (!new Set(["project", "user"]).has(target)) throw new Error("target must be project or user.");
  const validation = await validateClaudeBundle({ bundleRoot });
  if (!validation.valid) throw new Error(validation.diagnostics.join("\n"));
  const base = target === "project" ? path.join(destinationRoot, ".claude") : destinationRoot;
  const destinations = CLAUDE_AGENTS.map((name) => ({
    source: path.join(bundleRoot, "assets", "claude", "agents", `${name}.md`), target: path.join(base, "agents", `${name}.md`), relative: path.join("agents", `${name}.md`), directory: false
  }));
  destinations.push({
    source: path.join(bundleRoot, "assets", "claude", "skills", "neres-agentic-bmad"), target: path.join(base, "skills", "neres-agentic-bmad"), relative: path.join("skills", "neres-agentic-bmad"), directory: true
  });
  const conflicts = [];
  for (const item of destinations) if (await exists(item.target)) conflicts.push(item);
  if (conflicts.length && !force) throw new Error(`Destination already exists: ${conflicts.map((item) => item.target).join(", ")}. Use --force to back up and replace it.`);
  const backup = conflicts.length && force ? path.resolve(backupDirectory ?? path.join(base, "backups", `neres-agentic-bmad-claude-${timestamp()}`)) : null;
  if (dryRun) return { installed: destinations.map((item) => item.target), backupDirectory: backup, dryRun: true };
  if (backup) {
    for (const item of conflicts) {
      const targetPath = path.join(backup, item.relative);
      await mkdir(path.dirname(targetPath), { recursive: true });
      if (item.directory) await cp(item.target, targetPath, { recursive: true, force: false }); else await copyFile(item.target, targetPath);
      await rm(item.target, { recursive: item.directory, force: true });
    }
  }
  await mkdir(path.join(base, "agents"), { recursive: true });
  await mkdir(path.join(base, "skills"), { recursive: true });
  for (const item of destinations) if (item.directory) await cp(item.source, item.target, { recursive: true }); else await copyFile(item.source, item.target);
  return { installed: destinations.map((item) => item.target), backupDirectory: backup, dryRun: false };
}

function parse(source) {
  const frontmatter = source.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] ?? "";
  const scalar = (key) => frontmatter.match(new RegExp(`^${key}:\\s*(.+)$`, "m"))?.[1]?.trim();
  return { name: scalar("name"), description: scalar("description"), tools: scalar("tools"), model: scalar("model") };
}
async function names(root, diagnostics) { try { return (await readdir(root, { withFileTypes: true })).filter((e) => e.isFile() && e.name.endsWith(".md")).map((e) => e.name.slice(0, -3)).sort(); } catch (error) { diagnostics.push(`Cannot read Claude agents: ${message(error)}.`); return []; } }
async function safeRead(file, diagnostics, label) { try { return await readFile(file, "utf8"); } catch (error) { diagnostics.push(`${label}: ${message(error)}.`); return null; } }
async function exists(target) { try { await access(target); return true; } catch { return false; } }
function timestamp() { return new Date().toISOString().replaceAll(/[-:.]/g, "").replace("Z", "Z"); }
function message(error) { return error instanceof Error ? error.message : "unknown error"; }
