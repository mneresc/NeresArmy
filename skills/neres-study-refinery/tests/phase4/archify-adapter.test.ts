import { access, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { expect, test } from "vitest";
import { ArchifyAdapter } from "../../src/diagrams/archify-adapter.js";
import type { DiagramCandidate } from "../../src/diagrams/types.js";
import { createVault } from "../support/vault.js";

const candidate: DiagramCandidate = {
  id: "fluxo",
  title: "Fluxo",
  type: "workflow",
  sourcePaths: ["AFO/fluxo.png"],
  sourceIsVisual: true,
  confidence: 0.99,
  nodes: [
    { id: "n1", label: "Início", confidence: 0.99 },
    { id: "n2", label: "Fim", confidence: 0.99 }
  ],
  edges: [
    { id: "e1", from: "n1", to: "n2", label: null, confidence: 0.99 }
  ],
  groups: []
};

test("runs doctor, deliver, check and emits HTML plus canonical SVG", async () => {
  const vault = await createVault();
  const executable = path.join(vault.root, "fake-archify.mjs");
  await writeFile(
    executable,
    [
      'import { readFileSync, writeFileSync } from "node:fs";',
      'const [command, , inputPath, outputPath] = process.argv.slice(2);',
      'if (command === "doctor" || command === "check") process.exit(0);',
      'const input = JSON.parse(readFileSync(inputPath, "utf8"));',
      'const nodes = input.nodes ?? input.components ?? input.participants ?? input.states;',
      'const edges = input.edges ?? input.connections ?? input.messages ?? input.flows ?? input.transitions;',
      'const nodeHtml = nodes.map(n => `<g data-node-id="${n.id}" data-node-label="${n.label}"></g>`).join("");',
      'const edgeHtml = edges.map((e, i) => `<path data-edge-id="${e.id ?? `edge-${i + 1}`}" data-edge-from="${e.from}" data-edge-to="${e.to}"${e.label ? ` data-edge-label="${e.label}"` : ""}/>`).join("");',
      'writeFileSync(outputPath, `<html><body><svg xmlns="http://www.w3.org/2000/svg">${edgeHtml}${nodeHtml}</svg></body></html>`);'
    ].join("\n"),
    "utf8"
  );
  const outputDir = path.join(vault.root, "AFO", "_V2", "assets");
  const adapter = new ArchifyAdapter({ executablePath: executable });
  const result = await adapter.render(candidate, outputDir);

  await expect(access(result.htmlPath)).resolves.toBeUndefined();
  await expect(access(result.svgPath)).resolves.toBeUndefined();
  expect(await readFile(result.svgPath, "utf8")).toContain('data-node-id="n1"');
  expect(await readFile(result.inputPath, "utf8")).toContain('"diagram_type": "workflow"');
});

test("reports an explicit missing installation path", async () => {
  const vault = await createVault();
  const adapter = new ArchifyAdapter({
    executablePath: path.join(vault.root, "missing", "archify.mjs")
  });
  await expect(adapter.doctor()).rejects.toThrow(/Archify|install|doctor|missing/i);
});
