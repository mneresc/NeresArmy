import path from "node:path";
import type {
  ContentModel,
  VisualExtractionResult
} from "../contracts.ts";
import type {
  ArchifyDiagramType,
  DiagramCandidate,
  DiagramEdge,
  DiagramNode
} from "./types.ts";

function slug(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/gu, "")
    .toLocaleLowerCase("en-US")
    .replace(/[^a-z0-9]+/gu, "-")
    .replace(/^-|-$/gu, "") || "diagram";
}

function typeFromVisual(
  classification: VisualExtractionResult["classification"]
): ArchifyDiagramType {
  if (classification === "flowchart") return "workflow";
  if (classification === "chart") return "dataflow";
  if (classification === "mind-map") return "architecture";
  return "architecture";
}

export function candidateFromVisual(
  result: VisualExtractionResult,
  title: string
): DiagramCandidate | undefined {
  if (!result.diagram || result.diagram.nodes.length === 0) {
    return undefined;
  }
  const base = path.posix.basename(
    result.sourcePath,
    path.posix.extname(result.sourcePath)
  );
  return {
    id: `${slug(base)}-diagram-01`,
    title,
    type:
      result.diagram.groups.length > 0 || result.diagram.nodes.length > 6
        ? "architecture"
        : typeFromVisual(result.classification),
    sourcePaths: [result.sourcePath],
    sourceIsVisual: true,
    confidence: result.confidence,
    nodes: result.diagram.nodes.map((node) => ({ ...node })),
    edges: result.diagram.edges.map((edge, index) => ({
      id: `edge-${String(index + 1).padStart(3, "0")}`,
      ...edge
    })),
    groups: result.diagram.groups.map((group) => ({ ...group }))
  };
}

function numberedSteps(excerpt: string): string[] {
  return excerpt
    .split(/\r?\n/u)
    .map((line) => line.match(/^\s*\d+[.)]\s+(.+?)\s*$/u)?.[1])
    .filter((line): line is string => Boolean(line));
}

export function candidatesFromContentModel(
  model: ContentModel,
  sourcePath: string
): DiagramCandidate[] {
  const candidates: DiagramCandidate[] = [];
  let candidateIndex = 0;
  for (const claim of model.processes) {
    const steps = numberedSteps(claim.sourceExcerpt);
    if (steps.length < 3) {
      continue;
    }
    candidateIndex += 1;
    const nodes: DiagramNode[] = steps.map((label, index) => ({
      id: `step-${String(index + 1).padStart(2, "0")}`,
      label,
      confidence: claim.confidence
    }));
    const edges: DiagramEdge[] = nodes.slice(1).map((node, index) => ({
      id: `edge-${String(index + 1).padStart(3, "0")}`,
      from: nodes[index]?.id ?? "",
      to: node.id,
      label: null,
      confidence: claim.confidence
    }));
    candidates.push({
      id: `${slug(path.posix.basename(sourcePath, ".md"))}-diagram-${String(
        candidateIndex
      ).padStart(2, "0")}`,
      title: model.topic,
      type: "workflow",
      sourcePaths: [sourcePath],
      sourceIsVisual: false,
      confidence: claim.confidence,
      nodes,
      edges,
      groups: []
    });
  }
  return candidates;
}

export function scoreDiagramCandidate(candidate: DiagramCandidate): number {
  let score = 0;
  const outgoing = new Map<string, number>();
  const incoming = new Map<string, number>();
  for (const edge of candidate.edges) {
    outgoing.set(edge.from, (outgoing.get(edge.from) ?? 0) + 1);
    incoming.set(edge.to, (incoming.get(edge.to) ?? 0) + 1);
  }
  if (
    candidate.nodes.length >= 3 &&
    candidate.edges.length >= candidate.nodes.length - 1
  ) {
    score += 2;
  }
  if ([...outgoing.values()].some((count) => count >= 2)) score += 2;
  if (candidate.type === "sequence") score += 2;
  if (candidate.type === "lifecycle") score += 2;
  if (
    candidate.nodes.some((node) => !incoming.has(node.id)) &&
    candidate.nodes.some((node) => !outgoing.has(node.id))
  ) {
    score += 1;
  }
  if (candidate.edges.length > 0) score += 1;
  if (candidate.edges.length > candidate.nodes.length - 1) score += 1;
  if (candidate.sourceIsVisual) score += 1;
  if (candidate.edges.length === 0) score -= 2;
  if (candidate.nodes.length < 3) score -= 2;
  if (
    candidate.confidence < 0.85 ||
    candidate.nodes.some((node) => node.confidence < 0.85) ||
    candidate.edges.some((edge) => edge.confidence < 0.85)
  ) {
    score -= 2;
  }
  return score;
}
