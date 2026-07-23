import { expect, test } from "vitest";
import { buildArgs, runCli } from "../support/cli.js";
import { createVault } from "../support/vault.js";

test("enumerates a folder recursively and plans a separate output", async () => {
  const vault = await createVault();
  await vault.writeMarkdown("AFO/02-LDO.md");
  await vault.writeMarkdown("AFO/Sub/01-PPA.md");
  await vault.writeImage("AFO/Sub/quadro.webp");

  const result = await runCli(
    buildArgs({ vault: vault.root, input: "AFO", inputType: "folder" })
  );

  expect(result.missingEntrypoint).toBe(false);
  expect(result.code).toBe(0);
  expect(result.stdout).toContain("AFO/02-LDO.md");
  expect(result.stdout).toContain("AFO/Sub/01-PPA.md");
  expect(result.stdout).toContain("AFO/Sub/quadro.webp");
  expect(result.stdout).toMatch(/output\s*:\s*.*AFO[\\/]_V2/i);
});

test("does not enumerate descendants when recursion is disabled", async () => {
  const vault = await createVault();
  await vault.writeMarkdown("AFO/resumo.md");
  await vault.writeMarkdown("AFO/Sub/detalhe.md");

  const result = await runCli(
    buildArgs({
      vault: vault.root,
      input: "AFO",
      inputType: "folder",
      extra: ["--include-subfolders", "false"]
    })
  );

  expect(result.missingEntrypoint).toBe(false);
  expect(result.code).toBe(0);
  expect(result.stdout).toContain("AFO/resumo.md");
  expect(result.stdout).not.toContain("AFO/Sub/detalhe.md");
});

test("excludes every default source directory and a custom output tree", async () => {
  const vault = await createVault();
  const excluded = [
    ".obsidian",
    ".trash",
    ".git",
    "node_modules",
    "dist",
    "build",
    "coverage",
    "_V2",
    "V2",
    ".generated",
    "assets-generated",
    "archify-output",
    "resultado-custom"
  ];
  await vault.writeMarkdown("AFO/fonte.md");
  for (const directory of excluded) {
    await vault.writeMarkdown(`AFO/${directory}/nao-ler-${directory}.md`);
  }

  const result = await runCli(
    buildArgs({
      vault: vault.root,
      input: "AFO",
      inputType: "folder",
      extra: ["--output", "AFO/resultado-custom"]
    })
  );

  expect(result.missingEntrypoint).toBe(false);
  expect(result.code).toBe(0);
  expect(result.stdout).toContain("AFO/fonte.md");
  for (const directory of excluded) {
    expect(result.stdout).not.toContain(`nao-ler-${directory}.md`);
    expect(result.stdout).toMatch(new RegExp(`${directory.replace(".", "\\.")}.*excluded`, "i"));
  }
});
