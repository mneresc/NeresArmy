import { readFile } from "node:fs/promises";
import path from "node:path";
import { expect, test } from "vitest";
import { buildWriteArgs, runCli } from "../support/cli.js";
import { createOutsideMarkdown, createVault } from "../support/vault.js";

test("builds a note V2 and audit artifacts without changing the original", async () => {
  const vault = await createVault();
  const originalPath = await vault.writeMarkdown(
    "AFO/nota.md",
    "# Nota\n\nA regra deve ser aplicada em 10 dias.\n"
  );
  const original = await readFile(originalPath);

  const result = await runCli(
    buildWriteArgs({
      vault: vault.root,
      input: "AFO/nota.md",
      inputType: "note",
      extra: ["--profile", "law-afo"]
    })
  );

  expect(result.missingEntrypoint).toBe(false);
  expect(result.code).toBe(0);
  expect(result.stdout).toMatch(/built|created|written/i);
  expect(await readFile(originalPath)).toEqual(original);
  const outputRoot = path.join(vault.root, "AFO", "_V2");
  const v2 = await readFile(path.join(outputRoot, "nota-V2.md"), "utf8");
  expect(v2).toContain("## Regras");
  expect(v2).toContain("## Rastreabilidade");
  expect(v2).toContain("AFO/nota.md");
  const inventory = JSON.parse(
    await readFile(
      path.join(outputRoot, "_audit", "nota", "source-inventory.json"),
      "utf8"
    )
  ) as { sources: unknown[] };
  const model = JSON.parse(
    await readFile(
      path.join(outputRoot, "_audit", "nota", "content-model.json"),
      "utf8"
    )
  ) as { claims: unknown[] };
  expect(inventory.sources.length).toBeGreaterThan(0);
  expect(model.claims.length).toBeGreaterThan(0);
});

test("builds a folder recursively and ignores an existing V2 tree", async () => {
  const vault = await createVault();
  await vault.writeMarkdown("AFO/PPA.md", "# PPA\n\nRegra do PPA.");
  await vault.writeMarkdown("AFO/Sub/LDO.md", "# LDO\n\nRegra da LDO.");
  await vault.writeMarkdown("AFO/_V2/antiga.md", "# Não reutilizar");

  const result = await runCli(
    buildWriteArgs({
      vault: vault.root,
      input: "AFO",
      inputType: "folder",
      extra: ["--profile", "law-afo"]
    })
  );

  expect(result.code).toBe(0);
  expect(
    await readFile(path.join(vault.root, "AFO", "_V2", "PPA-V2.md"), "utf8")
  ).toContain("Regra do PPA.");
  expect(
    await readFile(
      path.join(vault.root, "AFO", "_V2", "Sub", "LDO-V2.md"),
      "utf8"
    )
  ).toContain("Regra da LDO.");
  await expect(
    readFile(path.join(vault.root, "AFO", "_V2", "antiga-V2.md"), "utf8")
  ).rejects.toThrow();
});

test("is byte-idempotent and never reads external link targets", async () => {
  const vault = await createVault();
  await createOutsideMarkdown(
    vault.outsideRoot,
    "segredo.md",
    "CONTEUDO-EXTERNO-PROIBIDO"
  );
  await vault.writeMarkdown(
    "TI/API.md",
    "# API\n\nA API recebe entrada.\n\n[web](https://example.invalid) [[../../segredo]]"
  );
  const args = buildWriteArgs({
    vault: vault.root,
    input: "TI/API.md",
    inputType: "note",
    extra: ["--profile", "technical-it"]
  });

  expect((await runCli(args)).code).toBe(0);
  const outputPath = path.join(vault.root, "TI", "_V2", "API-V2.md");
  const first = await readFile(outputPath);
  expect((await runCli(args)).code).toBe(0);
  const second = await readFile(outputPath);

  expect(second).toEqual(first);
  expect(second.toString("utf8")).not.toContain("CONTEUDO-EXTERNO-PROIBIDO");
});
