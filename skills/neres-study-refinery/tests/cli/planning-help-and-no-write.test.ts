import { readFile } from "node:fs/promises";
import path from "node:path";
import { expect, test } from "vitest";
import { buildArgs, runCli } from "../support/cli.js";
import { createVault } from "../support/vault.js";

test("reflects explicit planning flags", async () => {
  const vault = await createVault();
  await vault.writeMarkdown("AFO/nota.md");

  const result = await runCli(
    buildArgs({
      vault: vault.root,
      input: "AFO/nota.md",
      inputType: "note",
      extra: [
        "--profile",
        "law-afo",
        "--compression",
        "conservative",
        "--diagrams",
        "off",
        "--output",
        "Resultados/Nota-V2.md"
      ]
    })
  );

  expect(result.missingEntrypoint).toBe(false);
  expect(result.code).toBe(0);
  expect(result.stdout).toMatch(/profile\s*:\s*law-afo/i);
  expect(result.stdout).toMatch(/compression\s*:\s*conservative/i);
  expect(result.stdout).toMatch(/diagrams\s*:\s*off/i);
  expect(result.stdout).toMatch(/Resultados[\\/]Nota-V2\.md/);
});

test("documents the public S01 options in build help", async () => {
  const result = await runCli(["build", "--help"]);

  expect(result.missingEntrypoint).toBe(false);
  expect(result.code).toBe(0);
  for (const option of [
    "--vault",
    "--input",
    "--input-type",
    "--include-subfolders",
    "--profile",
    "--output",
    "--compression",
    "--diagrams",
    "--dry-run"
  ]) {
    expect(result.stdout).toContain(option);
  }
  expect(result.stdout).toMatch(/dry-run.*(?:does not|no).*write/i);
});

test("uses the specified defaults when no overrides are provided", async () => {
  const vault = await createVault();
  await vault.writeMarkdown("AFO/nota.md");

  const result = await runCli(
    buildArgs({
      vault: vault.root,
      input: "AFO/nota.md",
      inputType: "note"
    })
  );

  expect(result.missingEntrypoint).toBe(false);
  expect(result.code).toBe(0);
  expect(result.stdout).toMatch(/profile\s*:\s*auto/i);
  expect(result.stdout).toMatch(/compression\s*:\s*balanced/i);
  expect(result.stdout).toMatch(/diagrams\s*:\s*auto/i);
});

test("does not write on either successful or failing dry-run", async () => {
  const vault = await createVault();
  await vault.writeMarkdown("AFO/nota.md");
  const before = await vault.snapshot();

  const success = await runCli(
    buildArgs({
      vault: vault.root,
      input: "AFO/nota.md",
      inputType: "note"
    })
  );
  const failure = await runCli(
    buildArgs({
      vault: vault.root,
      input: "AFO/inexistente.md",
      inputType: "note"
    })
  );

  expect(success.missingEntrypoint).toBe(false);
  expect(failure.missingEntrypoint).toBe(false);
  expect(success.code).toBe(0);
  expect(failure.code).not.toBe(0);
  expect(await vault.snapshot()).toEqual(before);
});

test("ships the complete default configuration from the specification", async () => {
  const configPath = path.resolve(
    import.meta.dirname,
    "../../config/default-config.yaml"
  );
  const content = await readFile(configPath, "utf8").catch(() => "");

  expect(content).toContain("allow_web: false");
  expect(content).toContain("allow_model_knowledge: false");
  expect(content).toContain("overwrite_originals: false");
  expect(content).toContain("compression: balanced");
  expect(content).toContain("provider: archify");
  expect(content).toContain("fail_on_unsupported_claim: true");
  expect(content).toContain("fail_on_original_overwrite: true");
});
