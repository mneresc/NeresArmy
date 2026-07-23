import { expect, test } from "vitest";
import { prepareArchifyInput } from "../../src/diagrams/archify-input.js";
import {
  validateRenderedTopology
} from "../../src/diagrams/topology.js";
import type { DiagramCandidate } from "../../src/diagrams/types.js";

const candidate: DiagramCandidate = {
  id: "processo",
  title: "Processo",
  type: "workflow",
  sourcePaths: ["AFO/fluxo.png"],
  sourceIsVisual: true,
  confidence: 0.98,
  nodes: [
    { id: "n1", label: "Início", confidence: 0.99 },
    { id: "n2", label: "Fim", confidence: 0.99 }
  ],
  edges: [
    { id: "e1", from: "n1", to: "n2", label: "seguir", confidence: 0.98 }
  ],
  groups: []
};

function html(extra = ""): string {
  return [
    "<html><body><svg>",
    '<g data-node-id="n1" data-node-label="Início"></g>',
    '<g data-node-id="n2" data-node-label="Fim"></g>',
    '<path data-edge-id="e1" data-edge-from="n1" data-edge-to="n2" data-edge-label="seguir"/>',
    extra,
    "</svg></body></html>"
  ].join("");
}

test("prepares Archify input without changing authorized topology", () => {
  const prepared = prepareArchifyInput(candidate) as {
    nodes: Array<{ id: string; label: string }>;
    edges: Array<{ id: string; from: string; to: string; label?: string }>;
  };
  expect(prepared.nodes.map(({ id, label }) => ({ id, label }))).toEqual(
    candidate.nodes.map(({ id, label }) => ({ id, label }))
  );
  expect(
    prepared.edges.map(({ id, from, to, label }) => ({ id, from, to, label }))
  ).toEqual(candidate.edges.map(({ id, from, to, label }) => ({ id, from, to, label })));
});

test("accepts exact rendered topology", () => {
  const withViewerTemplate = html().replace(
    "<body>",
    '<body><script>const template = \'<g data-node-id="runtime-template"></g>\';</script>'
  );
  expect(() => validateRenderedTopology(candidate, withViewerTemplate)).not.toThrow();
});

test("rejects a new node, a new edge, and reversed direction", () => {
  expect(() =>
    validateRenderedTopology(
      candidate,
      html('<g data-node-id="n3" data-node-label="Inventado"></g>')
    )
  ).toThrow(/node|nó/i);
  expect(() =>
    validateRenderedTopology(
      candidate,
      html('<path data-edge-id="e2" data-edge-from="n2" data-edge-to="n1"/>')
    )
  ).toThrow(/edge|aresta|topology/i);
  expect(() =>
    validateRenderedTopology(
      candidate,
      html().replace('data-edge-from="n1" data-edge-to="n2"', 'data-edge-from="n2" data-edge-to="n1"')
    )
  ).toThrow(/direction|direção|edge|aresta/i);
});

test("rejects a changed authorized grouping", () => {
  const grouped: DiagramCandidate = {
    ...candidate,
    type: "architecture",
    groups: [{ id: "g1", label: "Grupo autorizado", nodeIds: ["n1", "n2"] }]
  };
  const groupedHtml = html()
    .replace(
      'data-node-id="n1" data-node-label="Início"',
      'data-node-id="n1" data-node-label="Início" data-node-context="Grupo autorizado"'
    )
    .replace(
      'data-node-id="n2" data-node-label="Fim"',
      'data-node-id="n2" data-node-label="Fim" data-node-context="Grupo autorizado"'
    );
  expect(() => validateRenderedTopology(grouped, groupedHtml)).not.toThrow();
  expect(() => validateRenderedTopology(grouped, html())).toThrow(/group|grupo/i);
});
