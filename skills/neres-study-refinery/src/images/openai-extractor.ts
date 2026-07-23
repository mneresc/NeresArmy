import { readFile } from "node:fs/promises";
import type {
  VisualContentExtractor,
  VisualExtractionResult,
  VisualInput
} from "../contracts.ts";
import { RefineryError } from "../errors.ts";
import { validateVisualPayload } from "./validate-result.ts";

export type OpenAITransport = (
  request: Record<string, unknown>
) => Promise<unknown>;

interface OpenAIVisualExtractorOptions {
  allowExternal: boolean;
  apiKey?: string;
  model?: string;
  endpoint?: string;
  transport?: OpenAITransport;
}

const VISUAL_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: [
    "classification",
    "confidence",
    "status",
    "transcription",
    "markdownTable",
    "latex",
    "regions",
    "diagram",
    "warnings"
  ],
  properties: {
    classification: {
      type: "string",
      enum: [
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
      ]
    },
    confidence: { type: "number", minimum: 0, maximum: 1 },
    status: {
      type: "string",
      enum: ["supported", "ambiguous", "conflicting", "missing", "illegible"]
    },
    transcription: { type: ["string", "null"] },
    markdownTable: { type: ["string", "null"] },
    latex: { type: ["string", "null"] },
    regions: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["id", "kind", "text", "confidence", "bounds"],
        properties: {
          id: { type: "string" },
          kind: {
            type: "string",
            enum: ["text", "table", "formula", "node", "edge", "unknown"]
          },
          text: { type: ["string", "null"] },
          confidence: { type: "number", minimum: 0, maximum: 1 },
          bounds: {
            anyOf: [
              { type: "null" },
              {
                type: "object",
                additionalProperties: false,
                required: ["x", "y", "width", "height"],
                properties: {
                  x: { type: "number" },
                  y: { type: "number" },
                  width: { type: "number" },
                  height: { type: "number" }
                }
              }
            ]
          }
        }
      }
    },
    diagram: {
      anyOf: [
        { type: "null" },
        {
          type: "object",
          additionalProperties: false,
          required: [
            "nodes",
            "edges",
            "groups",
            "uncertainNodes",
            "uncertainEdges"
          ],
          properties: {
            nodes: {
              type: "array",
              items: {
                type: "object",
                additionalProperties: false,
                required: ["id", "label", "confidence"],
                properties: {
                  id: { type: "string" },
                  label: { type: "string" },
                  confidence: { type: "number", minimum: 0, maximum: 1 }
                }
              }
            },
            edges: {
              type: "array",
              items: {
                type: "object",
                additionalProperties: false,
                required: ["from", "to", "label", "confidence"],
                properties: {
                  from: { type: "string" },
                  to: { type: "string" },
                  label: { type: ["string", "null"] },
                  confidence: { type: "number", minimum: 0, maximum: 1 }
                }
              }
            },
            groups: {
              type: "array",
              items: {
                type: "object",
                additionalProperties: false,
                required: ["id", "label", "nodeIds"],
                properties: {
                  id: { type: "string" },
                  label: { type: ["string", "null"] },
                  nodeIds: { type: "array", items: { type: "string" } }
                }
              }
            },
            uncertainNodes: { type: "array", items: { type: "string" } },
            uncertainEdges: { type: "array", items: { type: "string" } }
          }
        }
      ]
    },
    warnings: { type: "array", items: { type: "string" } }
  }
} as const;

function outputText(response: unknown): string {
  if (typeof response !== "object" || response === null || Array.isArray(response)) {
    throw new RefineryError(
      "ERR_VISUAL_EXTRACTION",
      "OpenAI returned an invalid response object."
    );
  }
  const output = (response as { output?: unknown }).output;
  if (!Array.isArray(output)) {
    throw new RefineryError(
      "ERR_VISUAL_EXTRACTION",
      "OpenAI response has no output array."
    );
  }
  for (const item of output) {
    if (typeof item !== "object" || item === null) continue;
    const content = (item as { content?: unknown }).content;
    if (!Array.isArray(content)) continue;
    for (const part of content) {
      if (
        typeof part === "object" &&
        part !== null &&
        (part as { type?: unknown }).type === "output_text" &&
        typeof (part as { text?: unknown }).text === "string"
      ) {
        return (part as { text: string }).text;
      }
    }
  }
  throw new RefineryError(
    "ERR_VISUAL_EXTRACTION",
    "OpenAI response has no structured output text."
  );
}

export class OpenAIVisualExtractor implements VisualContentExtractor {
  readonly provider = "openai" as const;
  readonly requiresExternalAccess = true;
  readonly #allowExternal: boolean;
  readonly #apiKey?: string;
  readonly #model?: string;
  readonly #transport: OpenAITransport;

  constructor(options: OpenAIVisualExtractorOptions) {
    this.#allowExternal = options.allowExternal;
    this.#apiKey = options.apiKey;
    this.#model = options.model;
    const endpoint = options.endpoint ?? "https://api.openai.com/v1/responses";
    this.#transport =
      options.transport ??
      (async (request) => {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "content-type": "application/json",
            authorization: `Bearer ${this.#apiKey ?? ""}`
          },
          body: JSON.stringify(request)
        });
        if (!response.ok) {
          throw new RefineryError(
            "ERR_VISUAL_EXTRACTION",
            `OpenAI visual extraction failed with HTTP ${String(response.status)}.`
          );
        }
        return await response.json();
      });
  }

  async extract(input: VisualInput): Promise<VisualExtractionResult> {
    if (!this.#allowExternal) {
      throw new RefineryError(
        "ERR_EXTERNAL_NOT_AUTHORIZED",
        "External AI access requires explicit authorization."
      );
    }
    if (!this.#apiKey || !this.#model) {
      throw new RefineryError(
        "ERR_EXTERNAL_NOT_AUTHORIZED",
        "OpenAI extraction requires an API key and explicit model."
      );
    }
    const bytes = await readFile(input.absolutePath);
    const request: Record<string, unknown> = {
      model: this.#model,
      store: false,
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text:
                "Analyze only the visible pixels of this authorized study image. " +
                "Do not use web, external facts, model knowledge, or inferred missing text. " +
                "Preserve numbers, symbols, table cells, formula syntax, nodes, edges, labels, " +
                "direction, and uncertainty. Use null or illegible instead of guessing."
            },
            {
              type: "input_image",
              image_url: `data:${input.mimeType};base64,${bytes.toString("base64")}`,
              detail: "high"
            }
          ]
        }
      ],
      text: {
        format: {
          type: "json_schema",
          name: "visual_evidence",
          strict: true,
          schema: VISUAL_SCHEMA
        }
      }
    };
    const response = await this.#transport(request);
    let payload: unknown;
    try {
      payload = JSON.parse(outputText(response));
    } catch (error) {
      if (error instanceof RefineryError) throw error;
      throw new RefineryError(
        "ERR_VISUAL_EXTRACTION",
        "OpenAI structured visual output is not valid JSON.",
        { cause: error }
      );
    }
    return validateVisualPayload(payload, this.provider, {
      id: input.sourceId,
      path: input.sourcePath,
      sha256: input.sha256
    });
  }
}
