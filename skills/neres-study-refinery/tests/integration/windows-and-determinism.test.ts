import { expect, test } from "vitest";
import { buildArgs, runCli } from "../support/cli.js";
import { createVault } from "../support/vault.js";

test("accepts Windows separators, spaces, accents, and preserves Unicode", async () => {
  const vault = await createVault();
  await vault.writeMarkdown("Área de Estudos/Visão Geral.md");

  const result = await runCli(
    buildArgs({
      vault: vault.root,
      input: "Área de Estudos\\Visão Geral.md",
      inputType: "note"
    })
  );

  expect(result.missingEntrypoint).toBe(false);
  expect(result.code).toBe(0);
  expect(result.stdout).toContain("Área de Estudos");
  expect(result.stdout).toContain("Visão Geral.md");
});

test("returns semantically identical plans for unchanged input", async () => {
  const vault = await createVault();
  await vault.writeMarkdown("AFO/10-LRF.md");
  await vault.writeMarkdown("AFO/02-LDO.md");
  await vault.writeMarkdown("AFO/01-PPA.md");

  const args = buildArgs({
    vault: vault.root,
    input: "AFO",
    inputType: "folder"
  });
  const first = await runCli(args);
  const second = await runCli(args);

  expect(first.missingEntrypoint).toBe(false);
  expect(second.missingEntrypoint).toBe(false);
  expect(first.code).toBe(0);
  expect(second.code).toBe(0);
  expect(second.stdout).toBe(first.stdout);
  expect(second.stderr).toBe(first.stderr);
});

test("orders discovered files deterministically", async () => {
  const vault = await createVault();
  await vault.writeMarkdown("AFO/10-LRF.md");
  await vault.writeMarkdown("AFO/01-PPA.md");
  await vault.writeMarkdown("AFO/02-LDO.md");

  const result = await runCli(
    buildArgs({ vault: vault.root, input: "AFO", inputType: "folder" })
  );

  expect(result.missingEntrypoint).toBe(false);
  expect(result.code).toBe(0);
  const positions = ["01-PPA.md", "02-LDO.md", "10-LRF.md"].map((name) =>
    result.stdout.indexOf(name)
  );
  expect(positions.every((position) => position >= 0)).toBe(true);
  expect(positions).toEqual([...positions].sort((left, right) => left - right));
});
