import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { BMAD_VERSION, installBundledBmad, validateBundledBmad } from "../scripts/bmad-bundle.mjs";

const packageRoot = path.resolve(import.meta.dirname, "..");

test("vendors a complete, licensed and cache-free BMAD 6.11.0", async () => {
  assert.equal(BMAD_VERSION, "6.11.0");
  const result = await validateBundledBmad({ bundleRoot: packageRoot });
  assert.equal(result.valid, true, result.diagnostics.join("\n"));
  assert.equal(result.skillCount, 49);
  assert.equal(result.cachedFiles.length, 0);
});

test("installs bundled BMAD without network and preserves an existing installation", async (t) => {
  const root = await temporaryRoot(t, "neres-bmad-");
  const skillRoot = path.join(root, ".claude", "skills");
  const installed = await installBundledBmad({ bundleRoot: packageRoot, projectRoot: root, skillRoot });
  assert.equal(installed.status, "installed");
  assert.equal(installed.version, "6.11.0");
  assert.equal(installed.skills.length, 49);

  const preserved = await installBundledBmad({ bundleRoot: packageRoot, projectRoot: root, skillRoot });
  assert.equal(preserved.status, "existing");
});

test("extends the same BMAD core to a newly selected client", async (t) => {
  const root = await temporaryRoot(t, "neres-bmad-multi-client-");
  const claudeSkills = path.join(root, ".claude", "skills");
  const codexSkills = path.join(root, ".codex", "skills");
  await installBundledBmad({ bundleRoot: packageRoot, projectRoot: root, skillRoot: claudeSkills });
  const extended = await installBundledBmad({ bundleRoot: packageRoot, projectRoot: root, skillRoot: codexSkills });
  assert.equal(extended.status, "extended");
  assert.equal(extended.skills.length, 49);
  assert.match(await readFile(path.join(root, "_bmad", "config.toml"), "utf8"), new RegExp(`project_name = "${path.basename(root)}"`));
});

test("rejects a partial BMAD installation before mixing files", async (t) => {
  const root = await temporaryRoot(t, "neres-bmad-partial-");
  await mkdir(path.join(root, "_bmad"), { recursive: true });
  await writeFile(path.join(root, "_bmad", "partial.txt"), "partial", "utf8");
  await assert.rejects(
    installBundledBmad({ bundleRoot: packageRoot, projectRoot: root, skillRoot: path.join(root, ".claude", "skills") }),
    /partial BMAD/i
  );
});

test("does not accept a same-sized but incomplete client skill set", async (t) => {
  const root = await temporaryRoot(t, "neres-bmad-wrong-skills-");
  const skillRoot = path.join(root, ".claude", "skills");
  await installBundledBmad({ bundleRoot: packageRoot, projectRoot: root, skillRoot });
  await rm(path.join(skillRoot, "bmad-help"), { recursive: true, force: true });
  await mkdir(path.join(skillRoot, "bmad-not-a-real-skill"));
  await assert.rejects(
    installBundledBmad({ bundleRoot: packageRoot, projectRoot: root, skillRoot }),
    /partial BMAD skills/i
  );
});

async function temporaryRoot(t, prefix) {
  const root = await mkdtemp(path.join(os.tmpdir(), prefix));
  t.after(() => rm(root, { recursive: true, force: true }));
  return root;
}
