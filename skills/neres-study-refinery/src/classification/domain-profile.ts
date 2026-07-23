import type {
  DidacticProfile,
  DomainProfileResult,
  Profile
} from "../contracts.ts";

const TERMS = {
  "law-afo": [
    "lei",
    "norma",
    "artigo",
    "competência",
    "competencia",
    "prazo",
    "vedação",
    "vedacao",
    "exceção",
    "excecao",
    "obrigação",
    "obrigacao",
    "obrigatório",
    "obrigatorio",
    "orçament",
    "tribut",
    "juríd",
    "deve",
    "pode"
  ],
  mathematics: [
    "fórmula",
    "formula",
    "variável",
    "variavel",
    "probabilidade",
    "equação",
    "equacao",
    "cálculo",
    "calculo",
    "estatíst",
    "álgebra",
    "algebra",
    "geometr",
    "percentual"
  ],
  "technical-it": [
    "api",
    "request",
    "response",
    "algoritmo",
    "banco de dados",
    "software",
    "protocolo",
    "servidor",
    "cloud",
    "código",
    "codigo",
    "função",
    "funcao",
    "componente",
    "entrada",
    "saída",
    "saida"
  ]
} as const;

function scoreTerms(markdown: string, terms: readonly string[]): {
  score: number;
  hits: string[];
} {
  const normalized = markdown.toLocaleLowerCase("pt-BR");
  const hits = terms.filter((term) => normalized.includes(term));
  return { score: hits.length, hits };
}

export function classifyDomainProfile(
  markdown: string,
  requestedProfile: Profile
): DomainProfileResult {
  const law = scoreTerms(markdown, TERMS["law-afo"]);
  const mathematics = scoreTerms(markdown, TERMS.mathematics);
  const technical = scoreTerms(markdown, TERMS["technical-it"]);
  const scores = {
    "law-afo": law.score,
    mathematics: mathematics.score,
    "technical-it": technical.score
  };
  const signals = [
    ...law.hits.map((term) => `law-afo:${term}`),
    ...mathematics.hits.map((term) => `mathematics:${term}`),
    ...technical.hits.map((term) => `technical-it:${term}`)
  ];

  if (requestedProfile !== "auto") {
    return {
      profile: requestedProfile,
      source: "manual",
      scores,
      signals
    };
  }

  const ranked = (Object.entries(scores) as Array<
    [Exclude<DidacticProfile, "hybrid" | "generic">, number]
  >).sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]));
  const strongProfiles = ranked.filter(([, score]) => score >= 2);
  let profile: DidacticProfile;
  if (strongProfiles.length >= 2) {
    profile = "hybrid";
  } else if ((ranked[0]?.[1] ?? 0) >= 2) {
    profile = ranked[0]?.[0] ?? "generic";
  } else {
    profile = "generic";
  }
  return { profile, source: "automatic", scores, signals };
}
