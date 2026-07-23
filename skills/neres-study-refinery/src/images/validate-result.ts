import {
  CLAIM_STATUSES,
  VISUAL_CLASSIFICATIONS,
  type ClaimStatus,
  type VisualDiagram,
  type VisualExtractionResult,
  type VisualProvider,
  type VisualRegion
} from "../contracts.ts";
import { RefineryError } from "../errors.ts";

function record(value: unknown, label: string): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new RefineryError(
      "ERR_VISUAL_EXTRACTION",
      `Visual field '${label}' must be an object.`
    );
  }
  return value as Record<string, unknown>;
}

function stringValue(value: unknown, label: string): string {
  if (typeof value !== "string") {
    throw new RefineryError(
      "ERR_VISUAL_EXTRACTION",
      `Visual field '${label}' must be a string.`
    );
  }
  return value;
}

function nullableString(value: unknown, label: string): string | null {
  return value === null ? null : stringValue(value, label);
}

function confidence(value: unknown, label: string): number {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0 || value > 1) {
    throw new RefineryError(
      "ERR_VISUAL_EXTRACTION",
      `Visual field '${label}' must be between 0 and 1.`
    );
  }
  return value;
}

function stringArray(value: unknown, label: string): string[] {
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) {
    throw new RefineryError(
      "ERR_VISUAL_EXTRACTION",
      `Visual field '${label}' must be a string array.`
    );
  }
  return [...value] as string[];
}

function regions(value: unknown): VisualRegion[] {
  if (!Array.isArray(value)) {
    throw new RefineryError(
      "ERR_VISUAL_EXTRACTION",
      "Visual field 'regions' must be an array."
    );
  }
  return value.map((item, index) => {
    const region = record(item, `regions[${String(index)}]`);
    const kind = stringValue(region.kind, "region.kind");
    if (!["text", "table", "formula", "node", "edge", "unknown"].includes(kind)) {
      throw new RefineryError("ERR_VISUAL_EXTRACTION", "Unknown visual region kind.");
    }
    let bounds: VisualRegion["bounds"] = null;
    if (region.bounds !== null) {
      const rawBounds = record(region.bounds, "region.bounds");
      const values = ["x", "y", "width", "height"].map((key) => rawBounds[key]);
      if (values.some((itemValue) => typeof itemValue !== "number")) {
        throw new RefineryError(
          "ERR_VISUAL_EXTRACTION",
          "Visual region bounds must contain numeric x, y, width, and height."
        );
      }
      bounds = {
        x: values[0] as number,
        y: values[1] as number,
        width: values[2] as number,
        height: values[3] as number
      };
    }
    return {
      id: stringValue(region.id, "region.id"),
      kind: kind as VisualRegion["kind"],
      text: nullableString(region.text, "region.text"),
      confidence: confidence(region.confidence, "region.confidence"),
      bounds
    };
  });
}

function diagram(value: unknown): VisualDiagram | null {
  if (value === null) {
    return null;
  }
  const raw = record(value, "diagram");
  if (!Array.isArray(raw.nodes) || !Array.isArray(raw.edges) || !Array.isArray(raw.groups)) {
    throw new RefineryError(
      "ERR_VISUAL_EXTRACTION",
      "Visual diagram nodes, edges, and groups must be arrays."
    );
  }
  return {
    nodes: raw.nodes.map((item) => {
      const node = record(item, "diagram.node");
      return {
        id: stringValue(node.id, "diagram.node.id"),
        label: stringValue(node.label, "diagram.node.label"),
        confidence: confidence(node.confidence, "diagram.node.confidence")
      };
    }),
    edges: raw.edges.map((item) => {
      const edge = record(item, "diagram.edge");
      return {
        from: stringValue(edge.from, "diagram.edge.from"),
        to: stringValue(edge.to, "diagram.edge.to"),
        label: nullableString(edge.label, "diagram.edge.label"),
        confidence: confidence(edge.confidence, "diagram.edge.confidence")
      };
    }),
    groups: raw.groups.map((item) => {
      const group = record(item, "diagram.group");
      return {
        id: stringValue(group.id, "diagram.group.id"),
        label: nullableString(group.label, "diagram.group.label"),
        nodeIds: stringArray(group.nodeIds, "diagram.group.nodeIds")
      };
    }),
    uncertainNodes: stringArray(raw.uncertainNodes, "diagram.uncertainNodes"),
    uncertainEdges: stringArray(raw.uncertainEdges, "diagram.uncertainEdges")
  };
}

export function validateVisualPayload(
  value: unknown,
  provider: Exclude<VisualProvider, "none">,
  source: { id: string; path: string; sha256: string }
): VisualExtractionResult {
  const raw = record(value, "root");
  const classification = stringValue(raw.classification, "classification");
  const status = stringValue(raw.status, "status");
  if (!VISUAL_CLASSIFICATIONS.includes(classification as never)) {
    throw new RefineryError(
      "ERR_VISUAL_EXTRACTION",
      `Unknown visual classification '${classification}'.`
    );
  }
  if (!CLAIM_STATUSES.includes(status as never)) {
    throw new RefineryError(
      "ERR_VISUAL_EXTRACTION",
      `Unknown visual status '${status}'.`
    );
  }
  return {
    provider,
    sourceId: source.id,
    sourcePath: source.path,
    sourceSha256: source.sha256,
    classification: classification as VisualExtractionResult["classification"],
    confidence: confidence(raw.confidence, "confidence"),
    status: status as ClaimStatus,
    transcription: nullableString(raw.transcription, "transcription"),
    markdownTable: nullableString(raw.markdownTable, "markdownTable"),
    latex: nullableString(raw.latex, "latex"),
    regions: regions(raw.regions),
    diagram: diagram(raw.diagram),
    warnings: stringArray(raw.warnings, "warnings")
  };
}
