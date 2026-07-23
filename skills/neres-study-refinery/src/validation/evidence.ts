import type { ContentModel } from "../contracts.ts";

const MODALITY_PAIRS = [
  ["pode", "deve"],
  ["regra", "exceção"],
  ["facultativo", "obrigatório"],
  ["necessário", "suficiente"],
  ["antes", "depois"],
  ["cumulativo", "alternativo"],
  ["permitido", "vedado"]
] as const;

function unique(values: readonly string[]): string[] {
  return values.filter((value, index) => values.indexOf(value) === index);
}

function folded(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase("pt-BR");
}

export function compareNumberEvidence(source: string, output: string): string[] {
  const sourceNumbers = new Set(
    source.match(/(?<![\p{L}\d])\d+(?:[.,]\d+)*(?:%|\p{L}+)?/gu) ?? []
  );
  const outputNumbers =
    output.match(/(?<![\p{L}\d])\d+(?:[.,]\d+)*(?:%|\p{L}+)?/gu) ?? [];
  return unique(outputNumbers.filter((value) => !sourceNumbers.has(value)));
}

function entities(value: string): string[] {
  const acronyms = value.match(/\b[\p{Lu}]{2,}(?:-[\p{L}\d]+)?\b/gu) ?? [];
  const explicit = [...value.matchAll(/`([^`\n]{2,80})`/gu)].map(
    (match) => match[1] ?? ""
  );
  return unique([...acronyms, ...explicit].filter(Boolean));
}

export function compareEntityEvidence(source: string, output: string): string[] {
  const sourceEntities = new Set(entities(source));
  return entities(output).filter((value) => !sourceEntities.has(value));
}

function hasWord(value: string, word: string): boolean {
  return new RegExp(`(^|\\W)${word}(?:s|a|as|os)?(?=\\W|$)`, "u").test(value);
}

export function compareModalityEvidence(source: string, output: string): string[] {
  const sourceFolded = folded(source);
  const outputFolded = folded(output);
  const changes: string[] = [];
  for (const [leftOriginal, rightOriginal] of MODALITY_PAIRS) {
    const left = folded(leftOriginal);
    const right = folded(rightOriginal);
    if (
      hasWord(sourceFolded, left) &&
      !hasWord(sourceFolded, right) &&
      hasWord(outputFolded, right)
    ) {
      changes.push(`${leftOriginal}→${rightOriginal}`);
    }
    if (
      hasWord(sourceFolded, right) &&
      !hasWord(sourceFolded, left) &&
      hasWord(outputFolded, left)
    ) {
      changes.push(`${rightOriginal}→${leftOriginal}`);
    }
  }
  return changes;
}

function formulas(value: string): string[] {
  const results: string[] = [];
  const withoutDisplay = value.replace(/\$\$([\s\S]*?)\$\$/gu, (_match, body: string) => {
    results.push(body.replace(/\s+/gu, ""));
    return "";
  });
  for (const match of withoutDisplay.matchAll(/\$([^$\n]+)\$/gu)) {
    results.push((match[1] ?? "").replace(/\s+/gu, ""));
  }
  return unique(results);
}

export function compareFormulaEvidence(source: string, output: string): string[] {
  const sourceFormulas = new Set(formulas(source));
  return formulas(output).filter((value) => !sourceFormulas.has(value));
}

function codeBlocks(value: string): string[] {
  return [...value.matchAll(/^\s*(`{3,}|~{3,})([^\n]*)\n([\s\S]*?)^\s*\1\s*$/gmu)]
    .map((match) => {
      const language = (match[2] ?? "").trim();
      const body = (match[3] ?? "").replace(/\r\n?/gu, "\n").trimEnd();
      return `${language}:${body}`;
    });
}

export function compareCodeEvidence(source: string, output: string): string[] {
  const sourceCode = new Set(codeBlocks(source));
  return codeBlocks(output).filter((value) => !sourceCode.has(value));
}

export function validateGrounding(
  model: ContentModel,
  markdown: string,
  registeredSourcePaths: ReadonlySet<string>
): string[] {
  const issues: string[] = [];
  for (const claim of model.claims) {
    const marker = `<!-- claimId: ${claim.id} -->`;
    if (claim.status === "supported") {
      if (!registeredSourcePaths.has(claim.sourcePath)) {
        issues.push(`${claim.id}:unregistered-source`);
      }
      if (!markdown.includes(marker)) {
        issues.push(`${claim.id}:missing-marker`);
      }
      if (!markdown.includes(claim.sourceExcerpt)) {
        issues.push(`${claim.id}:missing-excerpt`);
      }
    } else if (markdown.includes(marker)) {
      issues.push(`${claim.id}:unsupported-marker`);
    }
  }
  return issues;
}

