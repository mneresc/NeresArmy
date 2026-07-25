import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import {
  discoverSkills,
  renderCatalog,
  validateSkills
} from "../catalog.mjs";
import { installSkills } from "../skill-installer.mjs";

async function makeFixture() {
  const root = await mkdtemp(path.join(os.tmpdir(), "neresarmy-catalog-"));
  for (const [slug, category] of [["alpha-skill", "engineering"], ["beta-skill", "study"]]) {
    const folder = path.join(root, "skills", slug);
    await mkdir(path.join(folder, "docs"), { recursive: true });
    await writeFile(path.join(folder, "SKILL.md"), `---\nname: ${slug}\ndescription: ${slug} description\n---\n\nUse this skill.\n`);
    await writeFile(path.join(folder, "README.md"), `# ${slug}\n`);
    await writeFile(path.join(folder, "docs", "COOKBOOK.md"), `# ${slug} cookbook\n`);
    await writeFile(path.join(folder, "catalog.json"), JSON.stringify({
      category,
      status: "stable",
      invocation: "model",
      npmPackage: null
    }, null, 2));
  }
  return root;
}

test("discovers valid skills and renders each catalog entry once", async (t) => {
  const root = await makeFixture();
  t.after(() => rm(root, { recursive: true, force: true }));

  const result = await validateSkills(root);
  assert.equal(result.valid, true, result.diagnostics.join("\n"));
  const skills = await discoverSkills(root);
  const catalog = renderCatalog(skills);

  assert.equal(skills.length, 2);
  assert.equal(catalog.split("\n").filter((line) => line.startsWith("| [alpha-skill]")).length, 1);
  assert.equal(catalog.split("\n").filter((line) => line.startsWith("| [beta-skill]")).length, 1);
  assert.match(catalog, /npx skills@latest add mneresc\/NeresArmy --skill alpha-skill/);
});

test("reports incomplete, mismatched and non-portable skill documentation", async (t) => {
  const root = await makeFixture();
  t.after(() => rm(root, { recursive: true, force: true }));
  await rm(path.join(root, "skills", "alpha-skill", "docs", "COOKBOOK.md"));
  await rm(path.join(root, "skills", "alpha-skill", "catalog.json"));
  await writeFile(path.join(root, "skills", "beta-skill", "SKILL.md"), "---\nname: other-name\ndescription: valid\n---\n");
  await writeFile(path.join(root, "skills", "beta-skill", "README.md"), "C:\\Users\\real-user\\vault\n");

  const result = await validateSkills(root);

  assert.equal(result.valid, false);
  assert.match(result.diagnostics.join("\n"), /alpha-skill.*docs\/COOKBOOK.md/i);
  assert.match(result.diagnostics.join("\n"), /alpha-skill.*catalog.json/i);
  assert.match(result.diagnostics.join("\n"), /beta-skill.*name/i);
  assert.match(result.diagnostics.join("\n"), /beta-skill.*local path/i);
});

test("installs exactly the selected skill or all canonical skills", async (t) => {
  const root = await makeFixture();
  const destination = await mkdtemp(path.join(os.tmpdir(), "neresarmy-install-"));
  t.after(async () => {
    await rm(root, { recursive: true, force: true });
    await rm(destination, { recursive: true, force: true });
  });

  await installSkills({ repositoryRoot: root, destination, selected: ["alpha-skill"] });
  await assert.doesNotReject(readFile(path.join(destination, "alpha-skill", "SKILL.md")));
  await assert.rejects(readFile(path.join(destination, "beta-skill", "SKILL.md")));

  const allDestination = path.join(destination, "all");
  await installSkills({ repositoryRoot: root, destination: allDestination, selected: "all" });
  await assert.doesNotReject(readFile(path.join(allDestination, "alpha-skill", "SKILL.md")));
  await assert.doesNotReject(readFile(path.join(allDestination, "beta-skill", "SKILL.md")));
});
