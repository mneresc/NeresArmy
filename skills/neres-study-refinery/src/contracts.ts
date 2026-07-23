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

export type InputType = (typeof INPUT_TYPES)[number];
export type Profile = (typeof PROFILES)[number];
export type CompressionMode = (typeof COMPRESSION_MODES)[number];
export type DiagramMode = (typeof DIAGRAM_MODES)[number];

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
