import assert from "node:assert/strict";
import { access, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import {
  EXPECTED_AGENTS,
  EXPECTED_MODELS,
  installBundle,
  validateBundle
} from "../scripts/opencode-bundle.mjs";

const bundleRoot = path.resolve(import.meta.dirname, "..");
const models = [
  "opencode-go/deepseek-v4-flash",
  "opencode-go/deepseek-v4-pro",
  "opencode-go/glm-5.2",
  "opencode-go/kimi-k2.7-code"
];

test("validates the complete agent bundle and routing contract", async () => {
  const result = await validateBundle({ bundleRoot, modelIds: models });

  assert.equal(result.valid, true, result.diagnostics.join("\n"));
  assert.equal(EXPECTED_AGENTS.length, 13);
  assert.equal(result.agents.filter((agent) => agent.mode === "primary").length, 2);
  assert.equal(result.agents.filter((agent) => agent.mode === "subagent").length, 11);
  assert.equal(EXPECTED_MODELS["neres-planner"], "opencode-go/deepseek-v4-pro");
  assert.equal(EXPECTED_MODELS["neres-developer"], "opencode-go/deepseek-v4-pro");
  assert.deepEqual(result.primaryTaskAllowlist["neres-planner"], [
    "plan-nerinhos-subagent-reader",
    "plan-nerinhos-subagent-writer",
    "plan-nerinhos-subagent-architect",
    "plan-nerinhos-subagent-critic"
  ]);
  assert.deepEqual(result.primaryTaskAllowlist["neres-developer"], [
    "dev-nerinhos-subagent-reader",
    "dev-nerinhos-subagent-mechanical",
    "dev-nerinhos-subagent-coder",
    "dev-nerinhos-subagent-test",
    "dev-nerinhos-subagent-qa",
    "dev-nerinhos-subagent-security",
    "dev-nerinhos-subagent-auditor"
  ]);
});

test("rejects a configured model missing from the OpenCode inventory", async () => {
  const result = await validateBundle({
    bundleRoot,
    modelIds: models.filter((model) => model !== "opencode-go/glm-5.2")
  });

  assert.equal(result.valid, false);
  assert.match(result.diagnostics.join("\n"), /opencode-go\/glm-5\.2.*not available/i);
});

test("dry-run reports targets without writing", async (t) => {
  const configDir = await makeConfigFixture(t);
  const result = await installBundle({ bundleRoot, configDir, modelIds: models, dryRun: true });

  assert.equal(result.installed.length, 14);
  await assert.rejects(access(path.join(configDir, "agents", "neres-planner.md")));
  await assert.rejects(access(path.join(configDir, "skills", "agentic-bmad", "SKILL.md")));
});

test("installs agents and protocol without modifying opencode.jsonc", async (t) => {
  const configDir = await makeConfigFixture(t);
  const configFile = path.join(configDir, "opencode.jsonc");
  const before = await readFile(configFile, "utf8");

  const result = await installBundle({ bundleRoot, configDir, modelIds: models });

  assert.equal(result.installed.length, 14);
  await assert.doesNotReject(access(path.join(configDir, "agents", "neres-developer.md")));
  await assert.doesNotReject(access(path.join(configDir, "skills", "agentic-bmad", "SKILL.md")));
  assert.equal(await readFile(configFile, "utf8"), before);
});

test("refuses overwrite unless force creates a recoverable backup", async (t) => {
  const configDir = await makeConfigFixture(t);
  const target = path.join(configDir, "agents", "neres-planner.md");
  const protocolTarget = path.join(configDir, "skills", "agentic-bmad");
  await mkdir(path.dirname(target), { recursive: true });
  await mkdir(protocolTarget, { recursive: true });
  await writeFile(target, "user-owned\n", "utf8");
  await writeFile(path.join(protocolTarget, "obsolete.md"), "old protocol file\n", "utf8");

  await assert.rejects(
    installBundle({ bundleRoot, configDir, modelIds: models }),
    /already exists/i
  );

  const result = await installBundle({ bundleRoot, configDir, modelIds: models, force: true });
  assert.ok(result.backupDirectory);
  assert.equal(
    await readFile(path.join(result.backupDirectory, "agents", "neres-planner.md"), "utf8"),
    "user-owned\n"
  );
  assert.equal(
    await readFile(
      path.join(result.backupDirectory, "skills", "agentic-bmad", "obsolete.md"),
      "utf8"
    ),
    "old protocol file\n"
  );
  assert.notEqual(await readFile(target, "utf8"), "user-owned\n");
  await assert.rejects(access(path.join(protocolTarget, "obsolete.md")));
});

async function makeConfigFixture(t) {
  const root = await import("node:fs/promises").then(({ mkdtemp }) =>
    mkdtemp(path.join(os.tmpdir(), "neres-agentic-bmad-"))
  );
  t.after(() => rm(root, { recursive: true, force: true }));
  await writeFile(path.join(root, "opencode.jsonc"), '{"plugin":["keep-me"]}\n', "utf8");
  return root;
}
