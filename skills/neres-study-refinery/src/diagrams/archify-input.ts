import type { DiagramCandidate } from "./types.ts";

const NODE_KIND = "backend";

function meta(candidate: DiagramCandidate): Record<string, unknown> {
  return {
    title: candidate.title,
    subtitle: `Fonte: ${candidate.sourcePaths.join(", ")}`,
    quality_profile: "standard"
  };
}

export function prepareArchifyInput(
  candidate: DiagramCandidate
): Record<string, unknown> {
  const base = {
    schema_version: 1,
    diagram_type: candidate.type,
    meta: meta(candidate),
    cards: []
  };
  if (candidate.type === "workflow") {
    const placements = candidate.nodes.map((node, index) => ({
      node,
      lane: `lane-${String(Math.floor(index / 3) + 1)}`,
      col: [0, 2, 4][index % 3] ?? 0
    }));
    const lanes = [
      ...new Set(placements.map((placement) => placement.lane))
    ].map((id, index) => ({
      id,
      label: `Fluxo ${String(index + 1)}`
    }));
    return {
      ...base,
      lanes,
      phases: [],
      groups: [],
      mainPath: candidate.nodes.map((node) => node.id),
      nodes: placements.map(({ node, lane, col }) => ({
        id: node.id,
        lane,
        col,
        width: Math.min(140, Math.max(64, node.label.length * 7 + 16)),
        type: NODE_KIND,
        label: node.label
      })),
      edges: candidate.edges.map((edge) => ({
        id: edge.id,
        from: edge.from,
        to: edge.to,
        ...(edge.label === null ? {} : { label: edge.label })
      }))
    };
  }
  if (candidate.type === "sequence") {
    return {
      ...base,
      participants: candidate.nodes.map((node) => ({
        id: node.id,
        type: NODE_KIND,
        label: node.label
      })),
      segments: [],
      messages: candidate.edges.map((edge, index) => ({
        id: edge.id,
        from: edge.from,
        to: edge.to,
        y: 180 + index * 48,
        label: edge.label ?? "",
        variant: "default"
      })),
      activations: []
    };
  }
  if (candidate.type === "lifecycle") {
    return {
      ...base,
      lanes: [{ id: "main", label: "Estados" }],
      states: candidate.nodes.map((node, index) => ({
        id: node.id,
        type:
          index === 0
            ? "start"
            : index === candidate.nodes.length - 1
              ? "success"
              : "active",
        label: node.label,
        lane: "main",
        col: index
      })),
      transitions: candidate.edges.map((edge) => ({
        id: edge.id,
        from: edge.from,
        to: edge.to,
        ...(edge.label === null ? {} : { label: edge.label })
      }))
    };
  }
  if (candidate.type === "dataflow") {
    return {
      ...base,
      stages: candidate.nodes.map((_, index) => ({
        label: `Stage ${String(index + 1)}`
      })),
      nodes: candidate.nodes.map((node, index) => ({
        id: node.id,
        type: NODE_KIND,
        label: node.label,
        stage: index,
        row: 0
      })),
      flows: candidate.edges.map((edge) => ({
        id: edge.id,
        from: edge.from,
        to: edge.to,
        label: edge.label ?? "",
        classification: ""
      }))
    };
  }
  return {
    ...base,
    components: candidate.nodes.map((node, index) => ({
      id: node.id,
      type: NODE_KIND,
      label: node.label,
      pos: [40 + index * 180, 250],
      size: [130, 60]
    })),
    boundaries: candidate.groups.map((group) => ({
      kind: "region",
      label: group.label ?? group.id,
      wraps: group.nodeIds
    })),
    connections: candidate.edges.map((edge) => ({
      id: edge.id,
      from: edge.from,
      to: edge.to,
      ...(edge.label === null ? {} : { label: edge.label })
    }))
  };
}
