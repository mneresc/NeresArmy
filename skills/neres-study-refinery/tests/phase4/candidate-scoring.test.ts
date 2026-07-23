import { expect, test } from "vitest";
import {
  candidateFromVisual,
  scoreDiagramCandidate
} from "../../src/diagrams/candidates.js";

const visual = {
  provider: "agent-manifest" as const,
  sourceId: "source-002",
  sourcePath: "AFO/fluxo.png",
  sourceSha256: "a".repeat(64),
  classification: "flowchart" as const,
  confidence: 0.98,
  status: "supported" as const,
  transcription: null,
  markdownTable: null,
  latex: null,
  regions: [],
  diagram: {
    nodes: [
      { id: "n1", label: "Início", confidence: 0.99 },
      { id: "n2", label: "Analisar", confidence: 0.98 },
      { id: "n3", label: "Fim", confidence: 0.99 }
    ],
    edges: [
      { from: "n1", to: "n2", label: null, confidence: 0.98 },
      { from: "n2", to: "n3", label: "aprovado", confidence: 0.97 }
    ],
    groups: [],
    uncertainNodes: [],
    uncertainEdges: []
  },
  warnings: []
};

test("scores an ordered source diagram at or above the Archify threshold", () => {
  const candidate = candidateFromVisual(visual, "Fluxo");
  expect(candidate?.type).toBe("workflow");
  expect(scoreDiagramCandidate(candidate!)).toBeGreaterThanOrEqual(5);
});

test("penalizes a visual with fewer than three elements", () => {
  const candidate = candidateFromVisual(
    {
      ...visual,
      diagram: {
        ...visual.diagram,
        nodes: visual.diagram.nodes.slice(0, 2),
        edges: visual.diagram.edges.slice(0, 1)
      }
    },
    "Curto"
  );
  expect(scoreDiagramCandidate(candidate!)).toBeLessThan(5);
});
