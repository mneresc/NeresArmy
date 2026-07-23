import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { expect, test, vi } from "vitest";
import { OpenAIVisualExtractor } from "../../src/images/openai-extractor.js";
import { createVault } from "../support/vault.js";

test("never calls OpenAI without explicit permission, key, and model", async () => {
  const vault = await createVault();
  const imagePath = await vault.writeImage("AFO/quadro.png");
  const bytes = await readFile(imagePath);
  const transport = vi.fn();
  const extractor = new OpenAIVisualExtractor({
    allowExternal: false,
    apiKey: "test-key",
    model: "test-model",
    transport
  });

  await expect(
    extractor.extract({
      sourceId: "source-001",
      sourcePath: "AFO/quadro.png",
      absolutePath: imagePath,
      sha256: createHash("sha256").update(bytes).digest("hex"),
      mimeType: "image/png"
    })
  ).rejects.toThrow(/authorization|authorized|permission/i);
  expect(transport).not.toHaveBeenCalled();
});

test("uses a closed-source structured Responses request when authorized", async () => {
  const vault = await createVault();
  const imagePath = await vault.writeImage("AFO/quadro.png");
  const bytes = await readFile(imagePath);
  const payload = {
    classification: "formula",
    confidence: 0.96,
    status: "supported",
    transcription: null,
    markdownTable: null,
    latex: "x_{1}=30",
    regions: [],
    diagram: null,
    warnings: []
  };
  const transport = vi.fn(async (_request: Record<string, unknown>) => ({
    output: [
      {
        type: "message",
        content: [{ type: "output_text", text: JSON.stringify(payload) }]
      }
    ]
  }));
  const extractor = new OpenAIVisualExtractor({
    allowExternal: true,
    apiKey: "test-key",
    model: "test-model",
    transport
  });

  const result = await extractor.extract({
    sourceId: "source-001",
    sourcePath: "AFO/quadro.png",
    absolutePath: imagePath,
    sha256: createHash("sha256").update(bytes).digest("hex"),
    mimeType: "image/png"
  });

  expect(result).toMatchObject({
    provider: "openai",
    classification: "formula",
    latex: "x_{1}=30"
  });
  const request = transport.mock.calls[0]?.[0] as Record<string, unknown>;
  expect(request).toMatchObject({ model: "test-model", store: false });
  expect(JSON.stringify(request)).toContain("data:image/png;base64,");
  expect(JSON.stringify(request)).toContain("json_schema");
  expect(JSON.stringify(request)).not.toContain("web_search");
});
