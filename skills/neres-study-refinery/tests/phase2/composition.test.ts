import { expect, test } from "vitest";
import { composeMarkdown } from "../../src/composition/compose.js";
import { analyzeMarkdown } from "../../src/markdown/analyze.js";

test("preserves a structured AFO table, callout, and Edge cases", () => {
  const markdown = [
    "# PPA",
    "## Regras",
    "| Item | Regra | Consequência/Pegadinha |",
    "|---|---|---|",
    "| Vigência | Deve observar 4 anos | Não alterar |",
    "",
    "> [!warning] Exceção",
    "> Pode ocorrer apenas na hipótese registrada.",
    "",
    "## Edge cases",
    "- Distinção preservada."
  ].join("\n");

  const output = composeMarkdown({
    sourcePath: "AFO/PPA.md",
    markdown,
    analysis: analyzeMarkdown(markdown),
    state: "structured",
    profile: "law-afo"
  });

  expect(output.markdown).toContain(
    "| Item | Regra | Consequência/Pegadinha |"
  );
  expect(output.markdown).toContain(
    "> [!warning] Exceção\n> Pode ocorrer apenas na hipótese registrada."
  );
  expect(output.markdown).toContain("## Edge cases");
  expect(output.markdown).toContain("## Rastreabilidade");
  expect(output.markdown).not.toMatch(/## [^\n]+\n\s*## /);
});

test.each([
  ["law-afo", "Visão central", "A regra deve ser observada."],
  ["mathematics", "Ideia central", "A fórmula é $$x = 2$$."],
  ["technical-it", "Função central", "A API recebe entrada e produz saída."]
])("composes raw %s content conservatively", (profile, heading, markdown) => {
  const output = composeMarkdown({
    sourcePath: "Tema.md",
    markdown,
    analysis: analyzeMarkdown(markdown),
    state: "raw",
    profile: profile as "law-afo" | "mathematics" | "technical-it"
  });

  expect(output.markdown).toContain(`# Tema\n\n## ${heading}`);
  expect(output.markdown).toContain(markdown);
  expect(output.markdown).toContain("## Rastreabilidade");
  expect(output.markdown).not.toContain("Exemplo inventado");
});
