import assert from "node:assert/strict";
import { access, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import {
  CODEX_AGENT_MODELS,
  CODEX_PROFILES,
  EXPECTED_CODEX_AGENTS,
  installCodexBundle,
  validateCodexBundle
} from "../scripts/codex-bundle.mjs";

const bundleRoot = path.resolve(import.meta.dirname, "..");
const modelIds = ["gpt-5.6-luna", "gpt-5.6-terra", "gpt-5.6-sol"];

test("validates the exact Codex profiles, agents and routing contract", async () => {
  const result = await validateCodexBundle({ bundleRoot, modelIds });

  assert.equal(result.valid, true, result.diagnostics.join("\n"));
  assert.equal(CODEX_PROFILES.length, 4);
  assert.equal(EXPECTED_CODEX_AGENTS.length, 11);
  assert.equal(CODEX_AGENT_MODELS["plan-nerinhos-subagent-reader"].model, "gpt-5.6-luna");
  assert.equal(CODEX_AGENT_MODELS["dev-nerinhos-subagent-coder"].model, "gpt-5.6-terra");
  assert.equal(CODEX_AGENT_MODELS["plan-nerinhos-subagent-architect"].model, "gpt-5.6-sol");
  assert.equal(result.profiles.every((profile) => profile.maxThreads === 6), true);
  const bugDoctor = await readFile(
    path.join(bundleRoot, "assets", "codex", "profiles", "neres-bug-doctor.config.toml"),
    "utf8"
  );
  assert.match(bugDoctor, /sandbox_mode = "read-only"/);
  assert.match(bugDoctor, /BugReport/);
  assert.match(bugDoctor, /edge-case-hunter/);
  assert.match(bugDoctor, /neres-quick-dev/);
  assert.match(bugDoctor, /neres-planner/);
  assert.match(bugDoctor, /needs-more-evidence/);
});

test("rejects a required model missing from the Codex inventory", async () => {
  const result = await validateCodexBundle({
    bundleRoot,
    modelIds: modelIds.filter((model) => model !== "gpt-5.6-sol")
  });

  assert.equal(result.valid, false);
  assert.match(result.diagnostics.join("\n"), /gpt-5\.6-sol.*not available/i);
});

test("dry-run reports managed targets without writing", async (t) => {
  const codexHome = await makeCodexHome(t);
  const result = await installCodexBundle({ bundleRoot, codexHome, modelIds, dryRun: true });

  assert.equal(result.installed.length, 16);
  await assert.rejects(access(path.join(codexHome, "agents", "dev-nerinhos-subagent-coder.toml")));
  await assert.rejects(access(path.join(codexHome, "neres-quick-dev.config.toml")));
  await assert.rejects(access(path.join(codexHome, "neres-bug-doctor.config.toml")));
  await assert.rejects(access(path.join(codexHome, "skills", "neres-agentic-bmad", "SKILL.md")));
});

test("installs Codex surfaces without modifying base config or unrelated files", async (t) => {
  const codexHome = await makeCodexHome(t);
  const config = path.join(codexHome, "config.toml");
  const unrelated = path.join(codexHome, "agents", "keep-me.toml");
  await mkdir(path.dirname(unrelated), { recursive: true });
  await writeFile(unrelated, "name = \"keep-me\"\n", "utf8");
  const before = await readFile(config, "utf8");

  const result = await installCodexBundle({ bundleRoot, codexHome, modelIds });

  assert.equal(result.installed.length, 16);
  assert.equal(await readFile(config, "utf8"), before);
  assert.equal(await readFile(unrelated, "utf8"), "name = \"keep-me\"\n");
  await assert.doesNotReject(access(path.join(codexHome, "neres-planner.config.toml")));
  await assert.doesNotReject(access(path.join(codexHome, "neres-bug-doctor.config.toml")));
  await assert.doesNotReject(access(path.join(codexHome, "skills", "neres-agentic-bmad", "SKILL.md")));
});

test("refuses conflicts unless force backs up and replaces managed targets", async (t) => {
  const codexHome = await makeCodexHome(t);
  const target = path.join(codexHome, "neres-planner.config.toml");
  await writeFile(target, "user profile\n", "utf8");

  await assert.rejects(
    installCodexBundle({ bundleRoot, codexHome, modelIds }),
    /already exists/i
  );

  const result = await installCodexBundle({ bundleRoot, codexHome, modelIds, force: true });
  assert.ok(result.backupDirectory);
  assert.equal(
    await readFile(path.join(result.backupDirectory, "neres-planner.config.toml"), "utf8"),
    "user profile\n"
  );
  assert.notEqual(await readFile(target, "utf8"), "user profile\n");
});

async function makeCodexHome(t) {
  const root = await import("node:fs/promises").then(({ mkdtemp }) =>
    mkdtemp(path.join(os.tmpdir(), "neres-agentic-codex-"))
  );
  t.after(() => rm(root, { recursive: true, force: true }));
  await writeFile(
    path.join(root, "config.toml"),
    'model = "existing-model"\napproval_policy = "never"\n',
    "utf8"
  );
  return root;
}
