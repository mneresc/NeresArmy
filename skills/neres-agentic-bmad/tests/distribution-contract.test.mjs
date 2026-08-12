import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const packageRoot = path.resolve(import.meta.dirname, "..");
const repositoryRoot = path.resolve(packageRoot, "..", "..");

test("ships complete Portuguese, English and Spanish documentation", async () => {
  for (const file of ["README.md", "README.en.md", "README.es.md", "docs/USAGE.md", "docs/USAGE.en.md", "docs/USAGE.es.md", "docs/COOKBOOK.md", "docs/COOKBOOK.en.md", "docs/COOKBOOK.es.md"]) {
    const source = await readFile(path.join(packageRoot, file), "utf8");
    assert.match(source, /Claude Code/i, file);
    assert.match(source, /BMAD/i, file);
  }
  for (const file of ["docs/SECURITY.md", "docs/SECURITY.en.md", "docs/SECURITY.es.md"]) {
    const source = await readFile(path.join(packageRoot, file), "utf8");
    assert.match(source, /BMAD/i, file);
    assert.match(source, /Socket/i, file);
  }
});

test("automates dependency review, runtime audit, SBOM and retained reports", async () => {
  const workflow = await readFile(path.join(repositoryRoot, ".github", "workflows", "supply-chain-security.yml"), "utf8");
  assert.match(workflow, /actions\/dependency-review-action@[0-9a-f]{40}/);
  assert.match(workflow, /continue-on-error: true/);
  assert.match(workflow, /runtime npm audit remains mandatory/);
  assert.match(workflow, /security:report/);
  assert.match(workflow, /retention-days: 90/);
  const manifest = JSON.parse(await readFile(path.join(packageRoot, "package.json"), "utf8"));
  assert.deepEqual(manifest.dependencies ?? {}, {});
  assert.equal(manifest.scripts.preinstall, undefined);
  assert.equal(manifest.scripts.postinstall, undefined);
});
