export const INPUT_TYPES = ["note", "folder"] as const;
export const PROFILES = [
  "auto",
  "law-afo",
  "mathematics",
  "technical-it",
  "hybrid",
  "generic"
] as const;
export const COMPRESSION_MODES = [
  "conservative",
  "balanced",
  "aggressive"
] as const;
export const DIAGRAM_MODES = ["auto", "off"] as const;
export const VISUAL_PROVIDERS = ["none", "agent-manifest", "openai"] as const;
export const VISUAL_CLASSIFICATIONS = [
  "textual-screenshot",
  "page-photo",
  "table",
  "diagram",
  "flowchart",
  "mind-map",
  "formula",
  "chart",
  "mixed-content",
  "decorative",
  "unknown"
] as const;

export type InputType = (typeof INPUT_TYPES)[number];
export type Profile = (typeof PROFILES)[number];
export type CompressionMode = (typeof COMPRESSION_MODES)[number];
export type DiagramMode = (typeof DIAGRAM_MODES)[number];
export type VisualProvider = (typeof VISUAL_PROVIDERS)[number];
export type VisualClassification = (typeof VISUAL_CLASSIFICATIONS)[number];

export interface BuildRequest {
  vault: string;
  input: string;
  inputType: InputType;
  includeSubfolders: boolean;
  profile: Profile;
  output?: string;
  compression: CompressionMode;
  diagrams: DiagramMode;
  dryRun: boolean;
  visualProvider?: VisualProvider;
  visualManifest?: string;
  allowExternalAi?: boolean;
  openAiModel?: string;
}

export interface ResolvedScope {
  vaultRoot: string;
  inputPath: string;
  inputType: InputType;
  includeSubfolders: boolean;
  outputPath: string;
  excludedDirectoryNames: readonly string[];
}

export type PlannedEntryKind = "markdown" | "image";
export type PlannedEntryOrigin = "input" | "folder" | "embed";

export interface PlannedEntry {
  path: string;
  absolutePath: string;
  kind: PlannedEntryKind;
  origin: PlannedEntryOrigin;
}

export type RejectedEntryReason =
  | "excluded-directory"
  | "outside-scope"
  | "outside-vault"
  | "unsupported-type"
  | "not-found";

export interface RejectedEntry {
  path: string;
  reason: RejectedEntryReason;
}

export interface DryRunPlan {
  scope: ResolvedScope;
  entries: PlannedEntry[];
  rejectedEntries: RejectedEntry[];
  requestedProfile: Profile;
  compression: CompressionMode;
  diagrams: DiagramMode;
  sourceStateStatus: "pending";
  diagramCandidateStatus: "pending";
  conflictStatus: "pending";
  writesPerformed: false;
}

export interface MarkdownHeading {
  level: number;
  text: string;
  line: number;
}

export interface MarkdownTable {
  headers: string[];
  rows: string[][];
  raw: string;
  startLine: number;
  endLine: number;
}

export interface MarkdownCodeBlock {
  language: string | null;
  content: string;
  raw: string;
  startLine: number;
  endLine: number;
}

export interface MarkdownFormula {
  content: string;
  display: boolean;
  raw: string;
  startLine: number;
  endLine: number;
}

export interface MarkdownCallout {
  type: string;
  title: string | null;
  content: string;
  raw: string;
  startLine: number;
  endLine: number;
}

export interface MarkdownAnalysis {
  headings: MarkdownHeading[];
  tables: MarkdownTable[];
  codeBlocks: MarkdownCodeBlock[];
  formulas: MarkdownFormula[];
  callouts: MarkdownCallout[];
  links: string[];
  wikilinks: string[];
  embeds: string[];
}

export type SourceProcessingStatus = "processed" | "pending" | "excluded" | "failed";

export interface InventorySource {
  id: string;
  type: PlannedEntryKind;
  path: string;
  size: number;
  sha256: string;
  status: SourceProcessingStatus;
  origin: PlannedEntryOrigin;
  markdown?: MarkdownAnalysis;
  referencedBy?: string[];
  classification?: string;
  confidence?: number;
}

export interface SourceInventory {
  scope: {
    type: InputType;
    path: string;
    include_subfolders: boolean;
  };
  sources: InventorySource[];
}

export type SourceState = "raw" | "structured";

export interface SourceStateResult {
  state: SourceState;
  score: number;
  signals: string[];
}

export type DidacticProfile = Exclude<Profile, "auto">;

export interface DomainProfileResult {
  profile: DidacticProfile;
  source: "manual" | "automatic";
  scores: Record<Exclude<DidacticProfile, "hybrid" | "generic">, number>;
  signals: string[];
}

export const CLAIM_STATUSES = [
  "supported",
  "ambiguous",
  "conflicting",
  "missing",
  "illegible"
] as const;

export type ClaimStatus = (typeof CLAIM_STATUSES)[number];

export type ClaimType =
  | "statement"
  | "definition"
  | "rule"
  | "condition"
  | "exception"
  | "prohibition"
  | "competence"
  | "classification"
  | "comparison"
  | "process"
  | "example"
  | "counterexample"
  | "exam-trap"
  | "formula"
  | "code"
  | "question";

export interface EvidenceClaim {
  id: string;
  type: ClaimType;
  statement: string;
  sourceId: string;
  sourcePath: string;
  sourceHeading: string | null;
  sourceExcerpt: string;
  sourceRegion: string | null;
  confidence: number;
  status: ClaimStatus;
}

export interface ContentModel {
  topic: string;
  profile: DidacticProfile;
  claims: EvidenceClaim[];
  definitions: EvidenceClaim[];
  rules: EvidenceClaim[];
  conditions: EvidenceClaim[];
  exceptions: EvidenceClaim[];
  prohibitions: EvidenceClaim[];
  competences: EvidenceClaim[];
  classifications: EvidenceClaim[];
  comparisons: EvidenceClaim[];
  processes: EvidenceClaim[];
  examples: EvidenceClaim[];
  counterexamples: EvidenceClaim[];
  examTraps: EvidenceClaim[];
  formulas: EvidenceClaim[];
  variables: EvidenceClaim[];
  codeBlocks: EvidenceClaim[];
  questions: EvidenceClaim[];
  conflicts: EvidenceClaim[];
  gaps: EvidenceClaim[];
}

export interface CompositionResult {
  markdown: string;
  profile: DidacticProfile;
  sourceState: SourceState;
}

export interface BuildResult {
  createdFiles: string[];
  sourceCount: number;
  noteCount: number;
}

export interface VisualInput {
  sourceId: string;
  sourcePath: string;
  absolutePath: string;
  sha256: string;
  mimeType: "image/png" | "image/jpeg" | "image/webp";
}

export interface VisualRegion {
  id: string;
  kind: "text" | "table" | "formula" | "node" | "edge" | "unknown";
  text: string | null;
  confidence: number;
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  } | null;
}

export interface VisualDiagramNode {
  id: string;
  label: string;
  confidence: number;
}

export interface VisualDiagramEdge {
  from: string;
  to: string;
  label: string | null;
  confidence: number;
}

export interface VisualDiagramGroup {
  id: string;
  label: string | null;
  nodeIds: string[];
}

export interface VisualDiagram {
  nodes: VisualDiagramNode[];
  edges: VisualDiagramEdge[];
  groups: VisualDiagramGroup[];
  uncertainNodes: string[];
  uncertainEdges: string[];
}

export interface VisualExtractionResult {
  provider: Exclude<VisualProvider, "none">;
  sourceId: string;
  sourcePath: string;
  sourceSha256: string;
  classification: VisualClassification;
  confidence: number;
  status: ClaimStatus;
  transcription: string | null;
  markdownTable: string | null;
  latex: string | null;
  regions: VisualRegion[];
  diagram: VisualDiagram | null;
  warnings: string[];
}

export interface VisualContentExtractor {
  readonly provider: Exclude<VisualProvider, "none">;
  readonly requiresExternalAccess: boolean;
  extract(input: VisualInput): Promise<VisualExtractionResult>;
}
