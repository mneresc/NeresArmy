import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { expect, test } from "vitest";
import { buildWriteArgs, runCli } from "../support/cli.js";
import { createVault } from "../support/vault.js";

test("writes deterministic frontmatter, claim markers and the complete report", async () => {
  const vault = await createVault();
  await vault.writeMarkdown(
    "AFO/01-PPA.md",
    "# PPA\n\nO prazo deve ser de 10 dias.\n"
  );

  const result = await runCli(
    buildWriteArgs({
      vault: vault.root,
      input: "AFO/01-PPA.md",
      inputType: "note",
      extra: ["--profile", "law-afo", "--diagrams", "off"]
    })
  );

  expect(result.code).toBe(0);
  const outputRoot = path.join(vault.root, "AFO", "_V2");
  const notePath = path.join(outputRoot, "01-PPA-V2.md");
  const note = await readFile(notePath, "utf8");
  expect(note).toMatch(/^---\ntype: study-note-v2/mu);
  expect(note).toContain("generated-from-vault-only: true");
  expect(note).toContain("grounding-status: passed");
  expect(note).toContain("<!-- claimId: claim-001 -->");
  expect(note).toContain("| Claim | Fonte | Local |");
  expect(note).toContain("| `claim-001` | [[AFO/01-PPA.md]] | PPA |");

  const reportPath = path.join(
    outputRoot,
    "_audit",
    "01-PPA-transformation-report.md"
  );
  const report = await readFile(reportPath, "utf8");
  for (const section of [
    "## Escopo",
    "## Estado das fontes",
    "## Extração",
    "## Transformação",
    "## Validação",
    "## Resultado"
  ]) {
    expect(report).toContain(section);
  }
  expect(report).toContain("- Status: passed");

  const first = await readFile(notePath);
  expect(
    (
      await runCli(
        buildWriteArgs({
          vault: vault.root,
          input: "AFO/01-PPA.md",
          inputType: "note",
          extra: ["--profile", "law-afo", "--diagrams", "off"]
        })
      )
    ).code
  ).toBe(0);
  expect(await readFile(notePath)).toEqual(first);
});

test("creates a naturally ordered folder overview and leaves no temp files", async () => {
  const vault = await createVault();
  await vault.writeMarkdown("AFO/10-LOA.md", "# LOA\n\nRegra da LOA.");
  await vault.writeMarkdown("AFO/2-LDO.md", "# LDO\n\nRegra da LDO.");
  await vault.writeMarkdown("AFO/01-PPA.md", "# PPA\n\nRegra do PPA.");

  const result = await runCli(
    buildWriteArgs({
      vault: vault.root,
      input: "AFO",
      inputType: "folder",
      extra: ["--profile", "law-afo", "--diagrams", "off"]
    })
  );

  expect(result.code).toBe(0);
  const outputRoot = path.join(vault.root, "AFO", "_V2");
  const overview = await readFile(
    path.join(outputRoot, "_Visão Geral.md"),
    "utf8"
  );
  expect(overview.indexOf("[[01-PPA-V2]]")).toBeLessThan(
    overview.indexOf("[[2-LDO-V2]]")
  );
  expect(overview.indexOf("[[2-LDO-V2]]")).toBeLessThan(
    overview.indexOf("[[10-LOA-V2]]")
  );
  expect(
    await readFile(
      path.join(outputRoot, "_audit", "AFO-transformation-report.md"),
      "utf8"
    )
  ).toContain("- Notas V2: 3");
  expect((await readdir(outputRoot, { recursive: true })).some((name) =>
    name.includes(".neres-tmp-")
  )).toBe(false);
});

