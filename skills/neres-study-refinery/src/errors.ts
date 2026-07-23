export const ERROR_CODES = [
  "ERR_USAGE",
  "ERR_VAULT_NOT_FOUND",
  "ERR_INPUT_NOT_FOUND",
  "ERR_INPUT_TYPE",
  "ERR_OUTSIDE_VAULT",
  "ERR_OUTPUT_COLLISION",
  "ERR_CONFIG",
  "ERR_DRY_RUN_REQUIRED",
  "ERR_VISUAL_MANIFEST",
  "ERR_VISUAL_EXTRACTION",
  "ERR_EXTERNAL_NOT_AUTHORIZED",
  "ERR_ARCHIFY",
  "ERR_DIAGRAM_TOPOLOGY",
  "ERR_INTERNAL"
] as const;

export type RefineryErrorCode = (typeof ERROR_CODES)[number];

export class RefineryError extends Error {
  readonly code: RefineryErrorCode;
  readonly path?: string;

  constructor(
    code: RefineryErrorCode,
    message: string,
    options?: { path?: string; cause?: unknown }
  ) {
    super(message, { cause: options?.cause });
    this.name = "RefineryError";
    this.code = code;
    this.path = options?.path;
  }
}

export function toSafeErrorMessage(error: unknown): string {
  if (error instanceof RefineryError) {
    const pathSuffix = error.path ? ` (${error.path})` : "";
    return `${error.code}: ${error.message}${pathSuffix}`;
  }
  return "ERR_INTERNAL: Unexpected refinery failure.";
}
