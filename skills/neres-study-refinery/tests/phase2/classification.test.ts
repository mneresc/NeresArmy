import { expect, test } from "vitest";
import { classifyDomainProfile } from "../../src/classification/domain-profile.js";
import { classifySourceState } from "../../src/classification/source-state.js";
import { analyzeMarkdown } from "../../src/markdown/analyze.js";

test("distinguishes raw and structured notes with explainable signals", () => {
  const raw = "- regra solta\n- outro fragmento\n\n##\n";
  const structured = [
    "# PPA",
    "## Regras",
    "| Item | Regra | Consequência/Pegadinha |",
    "|---|---|---|",
    "| Prazo | Deve observar 10 dias | Exceção indicada |",
    "## Edge cases",
    "> [!warning] Atenção",
    "> Texto da fonte."
  ].join("\n");

  expect(classifySourceState(raw, analyzeMarkdown(raw))).toMatchObject({
    state: "raw"
  });
  expect(classifySourceState(structured, analyzeMarkdown(structured))).toMatchObject({
    state: "structured"
  });
});

test.each([
  [
    "law-afo",
    "A lei estabelece competência, prazo, vedação, exceção e obrigação orçamentária."
  ],
  [
    "mathematics",
    "A fórmula usa variável, probabilidade, equação, cálculo e resultado estatístico."
  ],
  [
    "technical-it",
    "A API recebe request, executa algoritmo no banco de dados e retorna response."
  ],
  [
    "hybrid",
    "A norma define o limite obrigatório; a fórmula calcula a variável; a API registra o resultado no banco."
  ],
  ["generic", "Resumo de conteúdo introdutório sem terminologia específica."]
])("classifies %s from authorized terminology", (expected, markdown) => {
  expect(classifyDomainProfile(markdown, "auto").profile).toBe(expected);
});

test("manual profile overrides automatic classification", () => {
  const result = classifyDomainProfile(
    "lei, prazo, competência, vedação e obrigação",
    "technical-it"
  );
  expect(result).toMatchObject({
    profile: "technical-it",
    source: "manual"
  });
});
