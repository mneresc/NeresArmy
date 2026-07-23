import type {
  ClaimType,
  ContentModel,
  EvidenceClaim,
  VisualExtractionResult
} from "../contracts.ts";

function supportedText(result: VisualExtractionResult): {
  text: string;
  type: ClaimType;
  region: string | null;
} | undefined {
  if (result.markdownTable) {
    return {
      text: result.markdownTable,
      type: "statement",
      region: result.regions.find((region) => region.kind === "table")?.id ?? null
    };
  }
  if (result.latex) {
    return {
      text: `$$\n${result.latex}\n$$`,
      type: "formula",
      region: result.regions.find((region) => region.kind === "formula")?.id ?? null
    };
  }
  if (result.transcription) {
    const type = /(deve|deverá|devera|pode|é vedado|e vedado|somente)/iu.test(
      result.transcription
    )
      ? "rule"
      : "statement";
    return {
      text: result.transcription,
      type,
      region: result.regions.find((region) => region.text)?.id ?? null
    };
  }
  return undefined;
}

function appendTyped(model: ContentModel, claim: EvidenceClaim): void {
  if (claim.type === "rule") model.rules.push(claim);
  if (claim.type === "formula") model.formulas.push(claim);
  if (claim.type === "process") model.processes.push(claim);
}

export function appendVisualEvidence(
  model: ContentModel,
  result: VisualExtractionResult,
  minimumConfidence: number
): void {
  const content = supportedText(result);
  const supported =
    result.status === "supported" &&
    result.confidence >= minimumConfidence &&
    content !== undefined;
  const claim: EvidenceClaim = {
    id: `claim-${String(model.claims.length + 1).padStart(3, "0")}`,
    type: content?.type ?? "statement",
    statement: supported
      ? (content?.text ?? "")
      : "Trecho visual sem evidência suficiente para afirmação factual.",
    sourceId: result.sourceId,
    sourcePath: result.sourcePath,
    sourceHeading: null,
    sourceExcerpt: content?.text ?? "[ilegível]",
    sourceRegion: content?.region ?? result.regions[0]?.id ?? null,
    confidence: result.confidence,
    status: supported ? "supported" : result.status === "supported" ? "ambiguous" : result.status
  };
  model.claims.push(claim);
  if (claim.status === "supported") {
    appendTyped(model, claim);
  } else {
    model.gaps.push(claim);
  }
}
