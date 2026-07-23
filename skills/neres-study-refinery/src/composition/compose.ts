import path from "node:path";
import type {
  CompositionResult,
  ContentModel,
  DidacticProfile,
  MarkdownAnalysis,
  SourceState
} from "../contracts.ts";

interface ComposeInput {
  sourcePath: string;
  markdown: string;
  analysis: MarkdownAnalysis;
  state: SourceState;
  profile: DidacticProfile;
  model?: ContentModel;
}

const PRIMARY_HEADING: Record<DidacticProfile, string> = {
  "law-afo": "Visão central",
  mathematics: "Ideia central",
  "technical-it": "Função central",
  hybrid: "Visão integrada",
  generic: "Conteúdo consolidado"
};

function sourceTitle(input: ComposeInput): string {
  return (
    input.analysis.headings.find((heading) => heading.level === 1)?.text ??
    path.posix.basename(
      input.sourcePath,
      path.posix.extname(input.sourcePath)
    )
  );
}

function withoutFirstH1(markdown: string): string {
  const normalized = markdown.replace(/\r\n?/gu, "\n").trim();
  return normalized.replace(/^#\s+.+?(?:\n+|$)/u, "").trim();
}

function traceability(sourcePath: string, model?: ContentModel): string {
  const sources = [
    sourcePath,
    ...(model?.claims.map((claim) => claim.sourcePath) ?? [])
  ].filter((value, index, values) => values.indexOf(value) === index);
  return [
    "## Rastreabilidade",
    "",
    ...sources.map((source) => `- Fonte: [[${source}]]`)
  ].join("\n");
}

function uncertaintySection(model?: ContentModel): string | undefined {
  if (!model || model.gaps.length === 0) {
    return undefined;
  }
  const callouts = model.gaps.map((gap) => {
    const region = gap.sourceRegion ? `, região \`${gap.sourceRegion}\`` : "";
    return [
      "> [!warning] Trecho visual incerto",
      `> A fonte \`${gap.sourcePath}\`${region} não contém evidência legível suficiente.`
    ].join("\n");
  });
  return `## Lacunas e incertezas\n\n${callouts.join("\n\n")}`;
}

function visualEvidenceSection(input: ComposeInput): string | undefined {
  if (input.state !== "structured" || !input.model) {
    return undefined;
  }
  const excerpts = input.model.claims
    .filter(
      (claim) =>
        claim.status === "supported" && claim.sourcePath !== input.sourcePath
    )
    .map((claim) => claim.sourceExcerpt)
    .filter((value, index, values) => values.indexOf(value) === index);
  return excerpts.length > 0
    ? `## Evidências visuais\n\n${excerpts.join("\n\n")}`
    : undefined;
}

const SECTION_ORDER: Record<DidacticProfile, string[]> = {
  "law-afo": [
    "Visão central",
    "Regras",
    "Estrutura ou composição",
    "Competências e responsabilidades",
    "Condições e requisitos",
    "Exceções e vedações",
    "Relação com outros institutos",
    "Processos ou ciclos",
    "Definições importantes",
    "Pegadinhas e edge cases",
    "Revisão ativa"
  ],
  mathematics: [
    "Ideia central",
    "Quando usar",
    "Fórmula ou regra",
    "Procedimento passo a passo",
    "Exemplo resolvido",
    "Contraexemplo ou erro comum",
    "Questões das fontes"
  ],
  "technical-it": [
    "Função central",
    "Componentes",
    "Entradas e saídas",
    "Fluxo de funcionamento",
    "Regras e restrições",
    "Implementação ou sintaxe",
    "Exemplo técnico",
    "Comparações",
    "Falhas e edge cases",
    "Revisão ativa"
  ],
  hybrid: [
    "Visão integrada",
    "Regras",
    "Fórmulas e cálculos",
    "Arquitetura e funcionamento",
    "Exemplos das fontes",
    "Pegadinhas e edge cases",
    "Revisão ativa"
  ],
  generic: ["Conteúdo consolidado", "Exemplos das fontes", "Revisão ativa"]
};

function sectionForClaim(
  profile: DidacticProfile,
  type: ContentModel["claims"][number]["type"]
): string {
  if (profile === "law-afo") {
    const mapping = {
      rule: "Regras",
      competence: "Competências e responsabilidades",
      condition: "Condições e requisitos",
      exception: "Exceções e vedações",
      prohibition: "Exceções e vedações",
      classification: "Estrutura ou composição",
      comparison: "Relação com outros institutos",
      process: "Processos ou ciclos",
      definition: "Definições importantes",
      "exam-trap": "Pegadinhas e edge cases",
      question: "Revisão ativa"
    } as const;
    return mapping[type as keyof typeof mapping] ?? "Visão central";
  }
  if (profile === "mathematics") {
    const mapping = {
      condition: "Quando usar",
      formula: "Fórmula ou regra",
      rule: "Fórmula ou regra",
      process: "Procedimento passo a passo",
      example: "Exemplo resolvido",
      counterexample: "Contraexemplo ou erro comum",
      "exam-trap": "Contraexemplo ou erro comum",
      question: "Questões das fontes"
    } as const;
    return mapping[type as keyof typeof mapping] ?? "Ideia central";
  }
  if (profile === "technical-it") {
    const mapping = {
      classification: "Componentes",
      process: "Fluxo de funcionamento",
      rule: "Regras e restrições",
      condition: "Regras e restrições",
      prohibition: "Regras e restrições",
      code: "Implementação ou sintaxe",
      example: "Exemplo técnico",
      comparison: "Comparações",
      exception: "Falhas e edge cases",
      "exam-trap": "Falhas e edge cases",
      question: "Revisão ativa"
    } as const;
    return mapping[type as keyof typeof mapping] ?? "Função central";
  }
  if (profile === "hybrid") {
    if (type === "formula") return "Fórmulas e cálculos";
    if (type === "code" || type === "process") {
      return "Arquitetura e funcionamento";
    }
    if (type === "rule" || type === "condition" || type === "prohibition") {
      return "Regras";
    }
    if (type === "example" || type === "counterexample") {
      return "Exemplos das fontes";
    }
    if (type === "exam-trap" || type === "exception") {
      return "Pegadinhas e edge cases";
    }
    if (type === "question") return "Revisão ativa";
    return "Visão integrada";
  }
  if (type === "example" || type === "counterexample") {
    return "Exemplos das fontes";
  }
  if (type === "question") return "Revisão ativa";
  return "Conteúdo consolidado";
}

function composeFromModel(input: ComposeInput): string | undefined {
  if (!input.model || input.model.claims.length === 0) {
    return undefined;
  }
  const sections = new Map<string, string[]>();
  for (const claim of input.model.claims) {
    if (claim.status !== "supported") {
      continue;
    }
    const section = sectionForClaim(input.profile, claim.type);
    const excerpts = sections.get(section) ?? [];
    if (!excerpts.includes(claim.sourceExcerpt)) {
      excerpts.push(claim.sourceExcerpt);
    }
    sections.set(section, excerpts);
  }
  const rendered = [`# ${sourceTitle(input)}`];
  for (const section of SECTION_ORDER[input.profile]) {
    const excerpts = sections.get(section);
    if (!excerpts || excerpts.length === 0) {
      continue;
    }
    rendered.push(`## ${section}\n\n${excerpts.join("\n\n")}`);
  }
  return rendered.length > 1 ? rendered.join("\n\n") : undefined;
}

export function composeMarkdown(input: ComposeInput): CompositionResult {
  const normalized = input.markdown.replace(/\r\n?/gu, "\n").trim();
  let output: string;

  if (input.state === "structured") {
    output = normalized;
  } else {
    const modelComposition = composeFromModel(input);
    if (modelComposition) {
      output = modelComposition;
    } else {
      const body = withoutFirstH1(normalized);
      const parts = [
        `# ${sourceTitle(input)}`,
        `## ${PRIMARY_HEADING[input.profile]}`
      ];
      if (body.length > 0) {
        parts.push(body);
      }
      output = parts.join("\n\n");
    }
  }

  const visualEvidence = visualEvidenceSection(input);
  if (visualEvidence && !/^##\s+Evidências visuais\s*$/imu.test(output)) {
    output = `${output}\n\n${visualEvidence}`;
  }
  const uncertainties = uncertaintySection(input.model);
  if (uncertainties && !/^##\s+Lacunas e incertezas\s*$/imu.test(output)) {
    output = `${output}\n\n${uncertainties}`;
  }
  if (!/^##\s+Rastreabilidade\s*$/imu.test(output)) {
    output = `${output}\n\n${traceability(input.sourcePath, input.model)}`;
  }

  return {
    markdown: `${output.trim()}\n`,
    profile: input.profile,
    sourceState: input.state
  };
}
