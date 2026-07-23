import type {
  MarkdownAnalysis,
  SourceStateResult
} from "../contracts.ts";

const STRUCTURED_HEADINGS = new Set([
  "regras",
  "prazos",
  "edge cases",
  "definições",
  "definicoes",
  "comparações",
  "comparacoes",
  "revisão ativa",
  "revisao ativa",
  "componentes",
  "fórmula ou regra",
  "formula ou regra",
  "rastreabilidade"
]);

export function classifySourceState(
  markdown: string,
  analysis: MarkdownAnalysis
): SourceStateResult {
  const signals: string[] = [];
  let score = 0;

  if (analysis.headings.length >= 2) {
    score += 1;
    signals.push("multiple-headings");
  }
  if (
    analysis.headings.some((heading) =>
      STRUCTURED_HEADINGS.has(heading.text.trim().toLocaleLowerCase("pt-BR"))
    )
  ) {
    score += 2;
    signals.push("domain-heading");
  }
  if (analysis.tables.length > 0) {
    score += 2;
    signals.push("table");
  }
  if (analysis.callouts.length > 0) {
    score += 1;
    signals.push("callout");
  }
  if (/Item\s*\|\s*Regra\s*\|\s*(?:Consequência|Consequencia)\/Pegadinha/iu.test(markdown)) {
    score += 3;
    signals.push("law-afo-review-table");
  }
  if (/^##\s+Edge cases\s*$/imu.test(markdown)) {
    score += 2;
    signals.push("edge-cases-section");
  }

  return {
    state: score >= 3 ? "structured" : "raw",
    score,
    signals
  };
}
