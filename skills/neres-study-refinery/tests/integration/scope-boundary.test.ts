import path from "node:path";
import { expect, test } from "vitest";
import { buildArgs, runCli } from "../support/cli.js";
import {
  createDirectoryJunction,
  createOutsideMarkdown,
  createPrefixSiblingMarkdown,
  createVault
} from "../support/vault.js";

function expectScopeFailure(result: Awaited<ReturnType<typeof runCli>>): void {
  expect(result.missingEntrypoint).toBe(false);
  expect(result.code).not.toBe(0);
  expect(result.stderr).toMatch(/outside|scope|vault|overwrite/i);
}

test("rejects parent-segment escape before reading the external file", async () => {
  const vault = await createVault();
  const outside = await createOutsideMarkdown(vault.outsideRoot);

  const result = await runCli(
    buildArgs({
      vault: vault.root,
      input: path.relative(vault.root, outside),
      inputType: "note"
    })
  );

  expectScopeFailure(result);
  expect(result.stderr).not.toContain("Conteúdo externo proibido");
});

test("rejects an absolute input outside the vault", async () => {
  const vault = await createVault();
  const outside = await createOutsideMarkdown(vault.outsideRoot);

  const result = await runCli(
    buildArgs({ vault: vault.root, input: outside, inputType: "note" })
  );

  expectScopeFailure(result);
});

test("does not accept a sibling whose name only shares the vault prefix", async () => {
  const vault = await createVault("Concursos-");
  const sibling = await createPrefixSiblingMarkdown(vault.root);

  const result = await runCli(
    buildArgs({ vault: vault.root, input: sibling, inputType: "note" })
  );

  expectScopeFailure(result);
});

test("fails closed for a junction that resolves outside the vault", async () => {
  const vault = await createVault();
  await createOutsideMarkdown(vault.outsideRoot, "escape.md");
  await createDirectoryJunction(vault.outsideRoot, path.join(vault.root, "link"));

  const result = await runCli(
    buildArgs({
      vault: vault.root,
      input: "link/escape.md",
      inputType: "note"
    })
  );

  expectScopeFailure(result);
});

test("records an absolute external embed as rejected without reading it", async () => {
  const vault = await createVault();
  const outside = await createOutsideMarkdown(
    vault.outsideRoot,
    "imagem.png",
    "SEGREDO-EXTERNO"
  );
  await vault.writeMarkdown(
    "AFO/nota.md",
    `# Nota\n\n![[${outside.replaceAll("\\", "/")}]]\n`
  );

  const result = await runCli(
    buildArgs({
      vault: vault.root,
      input: "AFO/nota.md",
      inputType: "note"
    })
  );

  expect(result.missingEntrypoint).toBe(false);
  expect(result.code).toBe(0);
  expect(result.stdout).toMatch(/rejected.*imagem\.png|imagem\.png.*rejected/i);
  expect(result.stdout).not.toContain("SEGREDO-EXTERNO");
});

test("rejects an output that is the original note", async () => {
  const vault = await createVault();
  await vault.writeMarkdown("AFO/nota.md");

  const result = await runCli(
    buildArgs({
      vault: vault.root,
      input: "AFO/nota.md",
      inputType: "note",
      extra: ["--output", "AFO/nota.md"]
    })
  );

  expectScopeFailure(result);
});

test("rejects a default output that resolves outside the vault", async () => {
  const vault = await createVault();
  await vault.writeMarkdown("AFO/nota.md");
  await createDirectoryJunction(
    vault.outsideRoot,
    path.join(vault.root, "AFO", "_V2")
  );
  const before = await vault.snapshot();

  const result = await runCli(
    buildArgs({
      vault: vault.root,
      input: "AFO/nota.md",
      inputType: "note"
    })
  );

  expectScopeFailure(result);
  expect(await vault.snapshot()).toEqual(before);
});

test("does not traverse a junction alias to the output directory", async () => {
  const vault = await createVault();
  await vault.writeMarkdown("AFO/fonte.md");
  await vault.writeMarkdown("AFO/_V2/gerado.md");
  await createDirectoryJunction(
    path.join(vault.root, "AFO", "_V2"),
    path.join(vault.root, "AFO", "alias-output")
  );

  const result = await runCli(
    buildArgs({
      vault: vault.root,
      input: "AFO",
      inputType: "folder"
    })
  );

  expect(result.missingEntrypoint).toBe(false);
  expect(result.code).toBe(0);
  expect(result.stdout).not.toMatch(/Markdown: .*gerado\.md/i);
  expect(result.stdout).toMatch(/Excluded: AFO\/alias-output/i);
});

test("terminates safely when a junction points to an already visited ancestor", async () => {
  const vault = await createVault();
  await vault.writeMarkdown("AFO/Sub/fonte.md");
  await createDirectoryJunction(
    path.join(vault.root, "AFO"),
    path.join(vault.root, "AFO", "Sub", "voltar")
  );

  const result = await runCli(
    buildArgs({
      vault: vault.root,
      input: "AFO",
      inputType: "folder"
    })
  );

  expect(result.missingEntrypoint).toBe(false);
  expect(result.code).toBe(0);
  expect(result.stdout.match(/Markdown: AFO\/Sub\/fonte\.md/g)).toHaveLength(1);
  expect(result.stdout).toMatch(/Excluded: AFO\/Sub\/voltar/i);
});
