import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";

const packageRoot = path.resolve(import.meta.dirname, "..");
const cli = path.join(packageRoot, "scripts", "neres-agentic.mjs");

test("exposes a public npm binary and a portable package contract", async () => {
  const manifest = JSON.parse(await readFile(path.join(packageRoot, "package.json"), "utf8"));
  assert.equal(manifest.private, false);
  assert.equal(manifest.bin["neres-agentic"], "scripts/neres-agentic.mjs");
  assert.match(manifest.engines.node, /22\.12/);
  assert.deepEqual(manifest.files, ["assets", "docs", "scripts", "README.md", "SKILL.md", "LICENSE"]);
});

test("prints npx-oriented help without requiring a target", () => {
  const result = run(["--help"]);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /npx -y @mneresc\/neres-agentic-bmad install codex/);
  assert.match(result.stdout, /install opencode/);
  assert.match(result.stdout, /install devin --scope project/);
});

test("rejects missing and incompatible targets before dispatch", () => {
  const missing = run(["install"]);
  assert.notEqual(missing.status, 0);
  assert.match(missing.stderr, /target.*required/i);

  const incompatible = run(["install", "codex", "--scope", "user"]);
  assert.notEqual(incompatible.status, 0);
  assert.match(incompatible.stderr, /--scope.*Devin/i);
});

test("dispatches Codex dry-run from the packaged CLI", async (t) => {
  const root = await temporaryRoot(t, "neres-npx-codex-");
  const result = run([
    "install", "codex", "--codex-home", root,
    "--models-file", path.join(packageRoot, "fixtures", "codex-models.json"), "--dry-run"
  ]);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Codex: fixture/);
  assert.equal((result.stdout.match(/Would install:/g) ?? []).length, 15);
});

test("dispatches OpenCode dry-run from the packaged CLI", async (t) => {
  const root = await temporaryRoot(t, "neres-npx-opencode-");
  const result = run([
    "install", "opencode", "--config-dir", root,
    "--models-file", path.join(packageRoot, "fixtures", "models.txt"), "--dry-run"
  ]);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /OpenCode: 1\.18\.15|OpenCode: fixture/);
  assert.equal((result.stdout.match(/Would install:/g) ?? []).length, 14);
});

test("dispatches Devin project dry-run from the packaged CLI", async (t) => {
  const root = await temporaryRoot(t, "neres-npx-devin-");
  const result = run([
    "install", "devin", "--scope", "project", "--destination-root", root,
    "--models-file", path.join(packageRoot, "fixtures", "devin-models.json"), "--dry-run"
  ]);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Devin: fixture/);
  assert.match(result.stdout, /Target: project/);
  assert.equal((result.stdout.match(/Would install:/g) ?? []).length, 15);
});

function run(args) {
  return spawnSync(process.execPath, [cli, ...args], { cwd: packageRoot, encoding: "utf8" });
}

async function temporaryRoot(t, prefix) {
  const root = await mkdtemp(path.join(os.tmpdir(), prefix));
  t.after(() => rm(root, { recursive: true, force: true }));
  return root;
}
