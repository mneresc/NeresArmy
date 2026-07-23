import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { expect, test } from "vitest";
import { buildWriteArgs, runCli } from "../support/cli.js";
import { createVault } from "../support/vault.js";

test("renders and embeds an authorized Archify diagram", async () => {
  const vault = await createVault();
  await vault.writeMarkdown("AFO/fluxo.md", "# Fluxo\n\n![[fluxo.png]]\n");
  const imagePath = await vault.writeImage("AFO/fluxo.png");
  const hash = createHash("sha256").update(await readFile(imagePath)).digest("hex");
  await writeFile(
    path.join(vault.root, "visual-manifest.json"),
    JSON.stringify({
      version: 1,
      sources: [
        {
          sourcePath: "AFO/fluxo.png",
          sourceSha256: hash,
          classification: "flowchart",
          confidence: 0.99,
          status: "supported",
          transcription: null,
          markdownTable: null,
          latex: null,
          regions: [],
          diagram: {
            nodes: [
              { id: "n1", label: "Início", confidence: 0.99 },
              { id: "n2", label: "Analisar", confidence: 0.99 },
              { id: "n3", label: "Fim", confidence: 0.99 }
            ],
            edges: [
              { from: "n1", to: "n2", label: null, confidence: 0.99 },
              { from: "n2", to: "n3", label: null, confidence: 0.99 }
            ],
            groups: [],
            uncertainNodes: [],
            uncertainEdges: []
          },
          warnings: []
        }
      ]
    }),
    "utf8"
  );
  const fakeArchify = path.join(vault.root, "fake-archify.mjs");
  await writeFile(
    fakeArchify,
    [
      'import { readFileSync, writeFileSync } from "node:fs";',
      'const [command, , inputPath, outputPath] = process.argv.slice(2);',
      'if (command === "doctor" || command === "check") process.exit(0);',
      'const input = JSON.parse(readFileSync(inputPath, "utf8"));',
      'const nodes = input.nodes;',
      'const edges = input.edges;',
      'writeFileSync(outputPath, `<html><body><svg xmlns="http://www.w3.org/2000/svg">${edges.map(e => `<path data-edge-id="${e.id}" data-edge-from="${e.from}" data-edge-to="${e.to}"/>`).join("")}${nodes.map(n => `<g data-node-id="${n.id}" data-node-label="${n.label}"></g>`).join("")}</svg></body></html>`);'
    ].join("\n"),
    "utf8"
  );

  const result = await runCli(
    buildWriteArgs({
      vault: vault.root,
      input: "AFO/fluxo.md",
      inputType: "note",
      extra: [
        "--visual-provider",
        "agent-manifest",
        "--visual-manifest",
        "visual-manifest.json",
        "--archify-path",
        fakeArchify
      ]
    })
  );

  expect(result.code).toBe(0);
  const output = await readFile(
    path.join(vault.root, "AFO", "_V2", "fluxo-V2.md"),
    "utf8"
  );
  expect(output).toMatch(/!\[\[assets\/fluxo-diagram-01\.svg\]\]/);
  expect(output).toContain("Abrir diagrama interativo");
  expect(
    await readFile(
      path.join(vault.root, "AFO", "_V2", "assets", "fluxo-diagram-01.svg"),
      "utf8"
    )
  ).toContain('data-node-id="n1"');
});
