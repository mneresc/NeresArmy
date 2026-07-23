import { readFile } from "node:fs/promises";
import path from "node:path";
import { expect, test } from "vitest";
import { classifyDomainProfile } from "../../src/classification/domain-profile.js";
import { extractContentModel } from "../../src/evidence/extract.js";
import { buildSourceInventory } from "../../src/inventory/build-inventory.js";
import { analyzeMarkdown } from "../../src/markdown/analyze.js";
import { buildDryRunPlan } from "../../src/planning/dry-run.js";
import { loadDefaultConfig } from "../../src/config.js";
import { createVault } from "../support/vault.js";

test("inventories every supported Markdown structure with hash and status", async () => {
  const vault = await createVault();
  const markdown = [
    "# Regra principal",
    "",
    "> [!warning] Exceção",
    "> Somente nos casos da fonte.",
    "",
    "| Item | Regra |",
    "|---|---|",
    "| A | deve ocorrer |",
    "",
    "```ts",
    "const limite = 10;",
    "```",
    "",
    "$$x = 10$$",
    "",
    "[site](https://example.invalid) [[Outra nota]] ![[quadro.png]]"
  ].join("\n");
  await vault.writeMarkdown("AFO/nota.md", markdown);
  await vault.writeImage("AFO/quadro.png");

  const config = await loadDefaultConfig();
  const plan = await buildDryRunPlan(
    {
      vault: vault.root,
      input: "AFO/nota.md",
      inputType: "note",
      includeSubfolders: true,
      profile: "auto",
      compression: "balanced",
      diagrams: "auto",
      dryRun: true
    },
    config
  );
  const inventory = await buildSourceInventory(plan.scope, plan.entries);
  const note = inventory.sources.find((source) => source.type === "markdown");

  expect(note).toMatchObject({
    id: "source-001",
    path: "AFO/nota.md",
    status: "processed"
  });
  expect(note?.size).toBeGreaterThan(0);
  expect(note?.sha256).toMatch(/^[a-f0-9]{64}$/);
  expect(note?.markdown?.headings.map((heading) => heading.text)).toContain(
    "Regra principal"
  );
  expect(note?.markdown?.tables).toHaveLength(1);
  expect(note?.markdown?.codeBlocks).toHaveLength(1);
  expect(note?.markdown?.formulas).toHaveLength(1);
  expect(note?.markdown?.callouts).toHaveLength(1);
  expect(note?.markdown?.links).toContain("https://example.invalid");
  expect(note?.markdown?.wikilinks).toContain("Outra nota");
  expect(note?.markdown?.embeds).toContain("quadro.png");
  expect(inventory.sources.find((source) => source.type === "image")).toMatchObject({
    referencedBy: ["AFO/nota.md"]
  });
});

test("creates only literal supported claims with complete provenance", async () => {
  const vault = await createVault();
  const sourcePath = await vault.writeMarkdown(
    "AFO/prazo.md",
    "# Prazos\n\nO prazo deve ser de 10 dias.\n\n> [!warning] Exceção\n> Pode ocorrer em 5 dias.\n"
  );
  const markdown = await readFile(sourcePath, "utf8");
  const analysis = analyzeMarkdown(markdown);
  const profile = classifyDomainProfile(markdown, "auto");
  const model = extractContentModel(
    {
      id: "source-001",
      path: path.relative(vault.root, sourcePath).replaceAll("\\", "/"),
      markdown: analysis
    },
    markdown,
    profile.profile
  );

  expect(model.profile).toBe("law-afo");
  expect(model.claims.length).toBeGreaterThan(0);
  for (const claim of model.claims) {
    expect(claim.status).toBe("supported");
    expect(claim.confidence).toBe(1);
    expect(claim.sourceId).toBe("source-001");
    expect(claim.sourcePath).toBe("AFO/prazo.md");
    expect(markdown).toContain(claim.sourceExcerpt);
    expect(claim.statement).toBe(claim.sourceExcerpt);
  }
});
