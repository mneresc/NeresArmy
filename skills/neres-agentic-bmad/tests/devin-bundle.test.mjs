import assert from "node:assert/strict";
import { access, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import {
  DEVIN_ENTRY_SKILLS,
  DEVIN_MODELS,
  EXPECTED_DEVIN_AGENTS,
  installDevinBundle,
  validateDevinBundle
} from "../scripts/devin-bundle.mjs";

const bundleRoot = path.resolve(import.meta.dirname, "..");
const modelIds = ["swe-1.7", "claude-opus-5", "kimi-k", "glm", "deepseek-v4-pro", "mimo"];

test("validates the exact Devin skills, agents, routing and capability contract", async () => {
  const result = await validateDevinBundle({ bundleRoot, modelIds });

  assert.equal(result.valid, true, result.diagnostics.join("\n"));
  assert.equal(DEVIN_ENTRY_SKILLS.length, 4);
  assert.equal(EXPECTED_DEVIN_AGENTS.length, 11);
  assert.equal(DEVIN_MODELS["plan-nerinhos-subagent-reader"], "swe");
  assert.equal(DEVIN_MODELS["plan-nerinhos-subagent-architect"], "opus");
  assert.equal(result.skills.every((skill) => skill.triggers.includes("user")), true);
  const bugDoctor = await readFile(
    path.join(bundleRoot, "assets", "devin", "skills", "neres-bug-doctor", "SKILL.md"),
    "utf8"
  );
  assert.match(bugDoctor, /BugReport/);
  assert.match(bugDoctor, /edge-case-hunter/);
  assert.match(bugDoctor, /neres-quick-dev/);
  assert.match(bugDoctor, /neres-planner/);
  assert.match(bugDoctor, /needs-more-evidence/);
});

test("rejects a required model family missing from the Devin inventory", async () => {
  const result = await validateDevinBundle({ bundleRoot, modelIds: ["swe-1.7", "deepseek-v4-pro"] });

  assert.equal(result.valid, false);
  assert.match(result.diagnostics.join("\n"), /opus.*not available/i);
});

test("project dry-run reports managed targets without writing", async (t) => {
  const root = await makeRoot(t, "project");
  const result = await installDevinBundle({ bundleRoot, target: "project", destinationRoot: root, modelIds, dryRun: true });

  assert.equal(result.installed.length, 16);
  await assert.rejects(access(path.join(root, ".agents", "skills", "neres-planner", "SKILL.md")));
  await assert.rejects(access(path.join(root, ".agents", "agents", "dev-nerinhos-subagent-coder.md")));
});

test("project install preserves Devin config, MCP config and unrelated files", async (t) => {
  const root = await makeRoot(t, "project");
  const config = path.join(root, ".devin", "config.json");
  const mcp = path.join(root, ".devin", "mcp_config.json");
  const unrelated = path.join(root, ".agents", "skills", "keep-me", "SKILL.md");
  await mkdir(path.dirname(config), { recursive: true });
  await mkdir(path.dirname(unrelated), { recursive: true });
  await writeFile(config, "{\"permissions\":{}}\n", "utf8");
  await writeFile(mcp, "{\"mcpServers\":{}}\n", "utf8");
  await writeFile(unrelated, "keep\n", "utf8");

  const result = await installDevinBundle({ bundleRoot, target: "project", destinationRoot: root, modelIds });

  assert.equal(result.installed.length, 16);
  await assert.doesNotReject(access(path.join(root, ".agents", "skills", "neres-bug-doctor", "SKILL.md")));
  assert.equal(await readFile(config, "utf8"), "{\"permissions\":{}}\n");
  assert.equal(await readFile(mcp, "utf8"), "{\"mcpServers\":{}}\n");
  assert.equal(await readFile(unrelated, "utf8"), "keep\n");
});

test("user install refuses conflicts unless force creates a recoverable backup", async (t) => {
  const root = await makeRoot(t, "user");
  const target = path.join(root, "skills", "neres-planner", "SKILL.md");
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, "user version\n", "utf8");

  await assert.rejects(
    installDevinBundle({ bundleRoot, target: "user", destinationRoot: root, modelIds }),
    /already exists/i
  );

  const result = await installDevinBundle({ bundleRoot, target: "user", destinationRoot: root, modelIds, force: true });
  assert.ok(result.backupDirectory);
  assert.equal(
    await readFile(path.join(result.backupDirectory, "skills", "neres-planner", "SKILL.md"), "utf8"),
    "user version\n"
  );
  assert.notEqual(await readFile(target, "utf8"), "user version\n");
});

async function makeRoot(t, label) {
  const root = await import("node:fs/promises").then(({ mkdtemp }) =>
    mkdtemp(path.join(os.tmpdir(), `neres-agentic-devin-${label}-`))
  );
  t.after(() => rm(root, { recursive: true, force: true }));
  return root;
}
