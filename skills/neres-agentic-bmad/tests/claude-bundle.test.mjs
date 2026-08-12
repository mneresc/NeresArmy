import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { CLAUDE_AGENTS, installClaudeBundle, validateClaudeBundle } from "../scripts/claude-bundle.mjs";

const packageRoot = path.resolve(import.meta.dirname, "..");

test("validates native Claude Code entry agents, subagents and protocol", async () => {
  const result = await validateClaudeBundle({ bundleRoot: packageRoot });
  assert.equal(result.valid, true, result.diagnostics.join("\n"));
  assert.equal(CLAUDE_AGENTS.length, 14);
  assert.equal(result.entryAgents.length, 3);
});

test("installs Claude Code project assets without settings or MCP mutation", async (t) => {
  const root = await mkdtemp(path.join(os.tmpdir(), "neres-claude-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  const result = await installClaudeBundle({ bundleRoot: packageRoot, target: "project", destinationRoot: root });
  assert.equal(result.installed.length, 15);
  assert.equal(await readFile(path.join(root, ".claude", "agents", "neres-planner.md"), "utf8").then(Boolean), true);
  await assert.rejects(readFile(path.join(root, ".claude", "settings.json"), "utf8"));
  await assert.rejects(readFile(path.join(root, ".mcp.json"), "utf8"));
});
