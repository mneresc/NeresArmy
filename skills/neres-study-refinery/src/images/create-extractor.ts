import path from "node:path";
import type {
  BuildRequest,
  ResolvedScope,
  VisualContentExtractor,
  VisualInput
} from "../contracts.ts";
import { RefineryError } from "../errors.ts";
import { resolveExistingWithinVault } from "../scope/boundary.ts";
import { ManifestVisualExtractor } from "./manifest-extractor.ts";
import { OpenAIVisualExtractor } from "./openai-extractor.ts";

export async function createVisualExtractor(
  request: BuildRequest,
  scope: ResolvedScope
): Promise<VisualContentExtractor | undefined> {
  const provider = request.visualProvider ?? "none";
  if (provider === "none") {
    return undefined;
  }
  if (provider === "agent-manifest") {
    if (!request.visualManifest) {
      throw new RefineryError(
        "ERR_VISUAL_MANIFEST",
        "The agent-manifest provider requires --visual-manifest."
      );
    }
    const manifestPath = await resolveExistingWithinVault(
      scope.vaultRoot,
      request.visualManifest
    );
    return await ManifestVisualExtractor.fromFile(manifestPath);
  }
  return new OpenAIVisualExtractor({
    allowExternal: request.allowExternalAi ?? false,
    apiKey: process.env.OPENAI_API_KEY,
    model: request.openAiModel ?? process.env.NERES_OPENAI_MODEL
  });
}

export function imageMimeType(filePath: string): VisualInput["mimeType"] {
  const extension = path.extname(filePath).toLocaleLowerCase("en-US");
  if (extension === ".png") return "image/png";
  if (extension === ".webp") return "image/webp";
  if (extension === ".jpg" || extension === ".jpeg") return "image/jpeg";
  throw new RefineryError(
    "ERR_VISUAL_EXTRACTION",
    "Unsupported image type for visual extraction.",
    { path: filePath }
  );
}
