export type ArchifyDiagramType =
  | "workflow"
  | "sequence"
  | "lifecycle"
  | "dataflow"
  | "architecture";

export interface DiagramNode {
  id: string;
  label: string;
  confidence: number;
}

export interface DiagramEdge {
  id: string;
  from: string;
  to: string;
  label: string | null;
  confidence: number;
}

export interface DiagramGroup {
  id: string;
  label: string | null;
  nodeIds: string[];
}

export interface DiagramCandidate {
  id: string;
  title: string;
  type: ArchifyDiagramType;
  sourcePaths: string[];
  sourceIsVisual: boolean;
  confidence: number;
  nodes: DiagramNode[];
  edges: DiagramEdge[];
  groups: DiagramGroup[];
}

export interface ArchifyRenderResult {
  inputPath: string;
  htmlPath: string;
  svgPath: string;
}
