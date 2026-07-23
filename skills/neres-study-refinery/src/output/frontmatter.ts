import type {
  CompressionMode,
  DidacticProfile
} from "../contracts.ts";

function yamlArray(values: readonly string[]): string {
  return JSON.stringify(values);
}

export function addStudyFrontmatter(options: {
  markdown: string;
  profile: DidacticProfile;
  sourceScope: string;
  sourceNotes: readonly string[];
  sourceImages: readonly string[];
  compression: CompressionMode;
  diagramCount: number;
}): string {
  const frontmatter = [
    "---",
    "type: study-note-v2",
    `didactic-profile: ${options.profile}`,
    "generated-from-vault-only: true",
    `source-scope: ${JSON.stringify(options.sourceScope)}`,
    `source-notes: ${yamlArray(options.sourceNotes)}`,
    `source-images: ${yamlArray(options.sourceImages)}`,
    "grounding-status: passed",
    `compression-mode: ${options.compression}`,
    `diagram-count: ${String(options.diagramCount)}`,
    'generated-at: ""',
    "---"
  ].join("\n");
  return `${frontmatter}\n\n${options.markdown.trim()}\n`;
}

