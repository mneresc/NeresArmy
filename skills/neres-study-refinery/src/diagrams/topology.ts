import { RefineryError } from "../errors.ts";
import type { DiagramCandidate } from "./types.ts";

function decodeHtml(value: string): string {
  return value
    .replace(/&quot;/gu, '"')
    .replace(/&apos;|&#39;/gu, "'")
    .replace(/&lt;/gu, "<")
    .replace(/&gt;/gu, ">")
    .replace(/&amp;/gu, "&")
    .replace(/&#(\d+);/gu, (_match, decimal: string) =>
      String.fromCodePoint(Number(decimal))
    )
    .replace(/&#x([a-f0-9]+);/giu, (_match, hex: string) =>
      String.fromCodePoint(Number.parseInt(hex, 16))
    );
}

function attributes(tag: string): Map<string, string> {
  const values = new Map<string, string>();
  for (const match of tag.matchAll(/([A-Za-z_:][A-Za-z0-9_:.-]*)="([^"]*)"/gu)) {
    if (match[1] && match[2] !== undefined) {
      values.set(match[1], decodeHtml(match[2]));
    }
  }
  return values;
}

function fail(message: string): never {
  throw new RefineryError("ERR_DIAGRAM_TOPOLOGY", message);
}

export function validateRenderedTopology(
  candidate: DiagramCandidate,
  html: string
): void {
  const svgBlocks = html.match(/<svg\b[\s\S]*?<\/svg>/giu) ?? [];
  if (svgBlocks.length !== 1) {
    fail("Rendered artifact must contain exactly one canonical SVG.");
  }
  const canonicalSvg = svgBlocks[0] ?? "";
  const renderedNodes = new Map<string, string>();
  const renderedNodeContexts = new Map<string, string>();
  const renderedEdges = new Map<
    string,
    { from: string; to: string; label: string | null }
  >();
  for (const tag of canonicalSvg.match(/<[^>]+>/gu) ?? []) {
    const attrs = attributes(tag);
    const nodeId = attrs.get("data-node-id");
    if (nodeId) {
      const label = attrs.get("data-node-label");
      if (label === undefined) fail(`Rendered node '${nodeId}' has no label.`);
      const existing = renderedNodes.get(nodeId);
      if (existing !== undefined && existing !== label) {
        fail(`Rendered node '${nodeId}' has conflicting labels.`);
      }
      renderedNodes.set(nodeId, label);
      renderedNodeContexts.set(nodeId, attrs.get("data-node-context") ?? "");
    }
    const edgeId = attrs.get("data-edge-id");
    if (edgeId) {
      const from = attrs.get("data-edge-from");
      const to = attrs.get("data-edge-to");
      if (!from || !to) fail(`Rendered edge '${edgeId}' has no direction.`);
      const value = {
        from,
        to,
        label: attrs.get("data-edge-label") ?? null
      };
      const existing = renderedEdges.get(edgeId);
      if (
        existing &&
        (existing.from !== value.from ||
          existing.to !== value.to ||
          existing.label !== value.label)
      ) {
        fail(`Rendered edge '${edgeId}' has conflicting topology.`);
      }
      renderedEdges.set(edgeId, value);
    }
  }

  if (renderedNodes.size !== candidate.nodes.length) {
    fail("Rendered node set differs from the authorized topology.");
  }
  for (const node of candidate.nodes) {
    if (renderedNodes.get(node.id) !== node.label) {
      fail(`Rendered node '${node.id}' or its label differs from the source.`);
    }
  }
  if (renderedEdges.size !== candidate.edges.length) {
    fail("Rendered edge set differs from the authorized topology.");
  }
  for (const edge of candidate.edges) {
    const rendered = renderedEdges.get(edge.id);
    if (
      !rendered ||
      rendered.from !== edge.from ||
      rendered.to !== edge.to ||
      rendered.label !== edge.label
    ) {
      fail(`Rendered edge '${edge.id}' changed direction, label, or endpoints.`);
    }
  }
  for (const group of candidate.groups) {
    const groupLabel = group.label ?? group.id;
    for (const nodeId of group.nodeIds) {
      if (!candidate.nodes.some((node) => node.id === nodeId)) {
        fail(`Authorized group '${group.id}' references an unknown node.`);
      }
      const contexts = (renderedNodeContexts.get(nodeId) ?? "")
        .split("›")
        .map((value) => value.trim());
      if (!contexts.includes(groupLabel)) {
        fail(`Rendered group '${group.id}' changed membership for node '${nodeId}'.`);
      }
    }
  }
}
