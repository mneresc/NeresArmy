import { expect, test } from "vitest";
import { buildArgs, runCli } from "../support/cli.js";
import { createVault } from "../support/vault.js";

test.each([
  ["folder pointing to a Markdown file", "AFO/nota.md", "folder" as const],
  ["note pointing to a directory", "AFO", "note" as const],
  ["note pointing to an image", "AFO/quadro.png", "note" as const]
])("rejects %s", async (_label, input, inputType) => {
  const vault = await createVault();
  await vault.writeMarkdown("AFO/nota.md");
  await vault.writeImage("AFO/quadro.png");

  const result = await runCli(
    buildArgs({ vault: vault.root, input, inputType })
  );

  expect(result.missingEntrypoint).toBe(false);
  expect(result.code).not.toBe(0);
  expect(result.stderr).toMatch(/type|directory|file|markdown|\.md/i);
});

test("rejects a missing input without creating output", async () => {
  const vault = await createVault();
  const before = await vault.snapshot();

  const result = await runCli(
    buildArgs({
      vault: vault.root,
      input: "AFO/inexistente.md",
      inputType: "note"
    })
  );

  expect(result.missingEntrypoint).toBe(false);
  expect(result.code).not.toBe(0);
  expect(result.stderr).toMatch(/not found|does not exist|inexistente/i);
  expect(await vault.snapshot()).toEqual(before);
});

test("rejects missing required options", async () => {
  const result = await runCli(["build", "--dry-run"]);

  expect(result.missingEntrypoint).toBe(false);
  expect(result.code).not.toBe(0);
  expect(result.stderr).toMatch(/required.*vault|required.*input/i);
});
