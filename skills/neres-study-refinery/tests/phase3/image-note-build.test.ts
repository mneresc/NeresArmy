import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { expect, test } from "vitest";
import { buildWriteArgs, runCli } from "../support/cli.js";
import { createVault } from "../support/vault.js";

async function writeManifest(
  vaultRoot: string,
  imagePath: string,
  source: Record<string, unknown>
): Promise<string> {
  const bytes = await readFile(imagePath);
  const hash = createHash("sha256").update(bytes).digest("hex");
  const manifestPath = path.join(vaultRoot, "visual-manifest.json");
  await writeFile(
    manifestPath,
    `${JSON.stringify({
      version: 1,
      sources: [{ sourcePath: "AFO/quadro.png", sourceSha256: hash, ...source }]
    }, null, 2)}\n`,
    "utf8"
  );
  return manifestPath;
}

test("builds a note whose only didactic content is an embedded image", async () => {
  const vault = await createVault();
  await vault.writeMarkdown("AFO/imagem.md", "# Prazos\n\n![[quadro.png]]\n");
  const imagePath = await vault.writeImage("AFO/quadro.png");
  await writeManifest(vault.root, imagePath, {
    classification: "textual-screenshot",
    confidence: 0.99,
    status: "supported",
    transcription: "O prazo deve ser de 30 dias.",
    markdownTable: null,
    latex: null,
    regions: [
      { id: "r1", kind: "text", text: "O prazo deve ser de 30 dias.", confidence: 0.99, bounds: null }
    ],
    diagram: null,
    warnings: []
  });

  const result = await runCli(
    buildWriteArgs({
      vault: vault.root,
      input: "AFO/imagem.md",
      inputType: "note",
      extra: [
        "--profile",
        "law-afo",
        "--visual-provider",
        "agent-manifest",
        "--visual-manifest",
        "visual-manifest.json"
      ]
    })
  );

  expect(result.code).toBe(0);
  const output = await readFile(
    path.join(vault.root, "AFO", "_V2", "imagem-V2.md"),
    "utf8"
  );
  expect(output).toContain("O prazo deve ser de 30 dias.");
  expect(output).toContain("AFO/quadro.png");
});

test("renders illegible visual evidence only as uncertainty", async () => {
  const vault = await createVault();
  await vault.writeMarkdown("AFO/imagem.md", "# Imagem\n\n![[quadro.png]]\n");
  const imagePath = await vault.writeImage("AFO/quadro.png");
  await writeManifest(vault.root, imagePath, {
    classification: "mixed-content",
    confidence: 0.42,
    status: "illegible",
    transcription: null,
    markdownTable: null,
    latex: null,
    regions: [
      { id: "r1", kind: "unknown", text: null, confidence: 0.42, bounds: null }
    ],
    diagram: null,
    warnings: ["Uma parte da imagem não pôde ser transcrita com segurança."]
  });

  const result = await runCli(
    buildWriteArgs({
      vault: vault.root,
      input: "AFO/imagem.md",
      inputType: "note",
      extra: [
        "--visual-provider",
        "agent-manifest",
        "--visual-manifest",
        "visual-manifest.json"
      ]
    })
  );

  expect(result.code).toBe(0);
  const output = await readFile(
    path.join(vault.root, "AFO", "_V2", "imagem-V2.md"),
    "utf8"
  );
  expect(output).toContain("[!warning] Trecho visual incerto");
  expect(output).not.toContain("possível leitura");
});

test("adds supported visual evidence without degrading a structured note", async () => {
  const vault = await createVault();
  const table = [
    "| Item | Regra | Consequência/Pegadinha |",
    "|---|---|---|",
    "| Base | Deve ser preservada | Nenhuma |"
  ].join("\n");
  await vault.writeMarkdown(
    "AFO/imagem.md",
    `# Tema\n\n## Regras\n\n${table}\n\n## Edge cases\n\n![[quadro.png]]\n`
  );
  const imagePath = await vault.writeImage("AFO/quadro.png");
  await writeManifest(vault.root, imagePath, {
    classification: "textual-screenshot",
    confidence: 0.98,
    status: "supported",
    transcription: "A exceção visual pode ocorrer em 5 dias.",
    markdownTable: null,
    latex: null,
    regions: [
      { id: "r1", kind: "text", text: "A exceção visual pode ocorrer em 5 dias.", confidence: 0.98, bounds: null }
    ],
    diagram: null,
    warnings: []
  });

  const result = await runCli(
    buildWriteArgs({
      vault: vault.root,
      input: "AFO/imagem.md",
      inputType: "note",
      extra: [
        "--profile",
        "law-afo",
        "--visual-provider",
        "agent-manifest",
        "--visual-manifest",
        "visual-manifest.json"
      ]
    })
  );

  expect(result.code).toBe(0);
  const output = await readFile(
    path.join(vault.root, "AFO", "_V2", "imagem-V2.md"),
    "utf8"
  );
  expect(output).toContain(table);
  expect(output).toContain("## Edge cases");
  expect(output).toContain("## Evidências visuais");
  expect(output).toContain("A exceção visual pode ocorrer em 5 dias.");
});
