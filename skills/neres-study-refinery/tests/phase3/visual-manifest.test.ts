import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { expect, test } from "vitest";
import { ManifestVisualExtractor } from "../../src/images/manifest-extractor.js";
import { createVault } from "../support/vault.js";

test("loads hash-bound textual, table, formula, and diagram evidence", async () => {
  const vault = await createVault();
  const imagePath = await vault.writeImage("AFO/quadro.png");
  const bytes = await readFile(imagePath);
  const hash = createHash("sha256").update(bytes).digest("hex");
  const manifestPath = path.join(vault.root, "visual-manifest.json");
  const sources = [
    {
      sourcePath: "AFO/quadro.png",
      sourceSha256: hash,
      classification: "table",
      confidence: 0.97,
      status: "supported",
      transcription: null,
      markdownTable: "| Item | Valor |\n|---|---|\n| A | [ilegível] |",
      latex: null,
      regions: [
        {
          id: "r1",
          kind: "table",
          text: "Item Valor",
          confidence: 0.97,
          bounds: null
        }
      ],
      diagram: {
        nodes: [{ id: "n1", label: "Início", confidence: 0.99 }],
        edges: [],
        groups: [],
        uncertainNodes: [],
        uncertainEdges: []
      },
      warnings: []
    }
  ];
  await writeFile(
    manifestPath,
    `${JSON.stringify({ version: 1, sources }, null, 2)}\n`,
    "utf8"
  );

  const extractor = await ManifestVisualExtractor.fromFile(manifestPath);
  const result = await extractor.extract({
    sourceId: "source-001",
    sourcePath: "AFO/quadro.png",
    absolutePath: imagePath,
    sha256: hash,
    mimeType: "image/png"
  });

  expect(result).toMatchObject({
    provider: "agent-manifest",
    classification: "table",
    confidence: 0.97,
    status: "supported",
    markdownTable: expect.stringContaining("[ilegível]"),
    diagram: {
      nodes: [{ id: "n1", label: "Início", confidence: 0.99 }]
    }
  });
});

test("rejects a manifest whose image hash does not match", async () => {
  const vault = await createVault();
  const imagePath = await vault.writeImage("AFO/quadro.png");
  const manifestPath = path.join(vault.root, "visual-manifest.json");
  await writeFile(
    manifestPath,
    JSON.stringify({
      version: 1,
      sources: [
        {
          sourcePath: "AFO/quadro.png",
          sourceSha256: "0".repeat(64),
          classification: "textual-screenshot",
          confidence: 1,
          status: "supported",
          transcription: "Texto",
          markdownTable: null,
          latex: null,
          regions: [],
          diagram: null,
          warnings: []
        }
      ]
    }),
    "utf8"
  );
  const bytes = await readFile(imagePath);
  const actualHash = createHash("sha256").update(bytes).digest("hex");
  const extractor = await ManifestVisualExtractor.fromFile(manifestPath);

  await expect(
    extractor.extract({
      sourceId: "source-001",
      sourcePath: "AFO/quadro.png",
      absolutePath: imagePath,
      sha256: actualHash,
      mimeType: "image/png"
    })
  ).rejects.toThrow(/hash|sha-?256/i);
});
