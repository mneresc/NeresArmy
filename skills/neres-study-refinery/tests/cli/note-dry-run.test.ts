import { expect, test } from "vitest";
import { buildArgs, runCli } from "../support/cli.js";
import { createVault } from "../support/vault.js";

test("plans one authorized note and its embedded image without following wikilinks", async () => {
  const vault = await createVault();
  await vault.writeMarkdown(
    "AFO/01-PPA.md",
    "# PPA\n\n![[00-PPA.png]]\n\n[[LDO]]\n"
  );
  await vault.writeImage("AFO/00-PPA.png");
  await vault.writeMarkdown("AFO/LDO.md", "# Fora do escopo da nota\n");
  const before = await vault.snapshot();

  const result = await runCli(
    buildArgs({
      vault: vault.root,
      input: "AFO/01-PPA.md",
      inputType: "note"
    })
  );

  expect(result.missingEntrypoint).toBe(false);
  expect(result.code).toBe(0);
  expect(result.stderr).toBe("");
  expect(result.stdout).toContain("AFO/01-PPA.md");
  expect(result.stdout).toContain("AFO/00-PPA.png");
  expect(result.stdout).not.toContain("AFO/LDO.md");
  expect(result.stdout).toMatch(/AFO[\\/]_V2[\\/]01-PPA-V2\.md/);
  expect(result.stdout).toMatch(/writes performed\s*:\s*false/i);
  expect(await vault.snapshot()).toEqual(before);
});

test("reports later analysis fields as pending in S01", async () => {
  const vault = await createVault();
  await vault.writeMarkdown("AFO/resumo.md");

  const result = await runCli(
    buildArgs({
      vault: vault.root,
      input: "AFO/resumo.md",
      inputType: "note"
    })
  );

  expect(result.missingEntrypoint).toBe(false);
  expect(result.code).toBe(0);
  expect(result.stdout).toMatch(/source state\s*:\s*pending/i);
  expect(result.stdout).toMatch(/diagram candidates\s*:\s*pending/i);
  expect(result.stdout).toMatch(/conflicts\s*:\s*pending/i);
});
