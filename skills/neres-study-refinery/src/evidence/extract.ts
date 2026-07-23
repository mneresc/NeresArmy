import path from "node:path";
import type {
  ClaimType,
  ContentModel,
  DidacticProfile,
  EvidenceClaim,
  MarkdownAnalysis
} from "../contracts.ts";

interface EvidenceSource {
  id: string;
  path: string;
  markdown: MarkdownAnalysis;
}

interface EvidenceBlock {
  excerpt: string;
  heading: string | null;
  forcedType?: ClaimType;
}

function claimType(excerpt: string, forcedType?: ClaimType): ClaimType {
  if (forcedType) {
    return forcedType;
  }
  const text = excerpt.toLocaleLowerCase("pt-BR");
  if (text.includes("[!question]") || text.includes("?")) return "question";
  if (/(pegadinha|erro comum|atenção|atencao)/iu.test(text)) return "exam-trap";
  if (/contraexemplo/iu.test(text)) return "counterexample";
  if (/exemplo/iu.test(text)) return "example";
  if (/(é vedado|e vedado|não pode|nao pode|proibid)/iu.test(text)) {
    return "prohibition";
  }
  if (/(exceção|excecao|excepcional)/iu.test(text)) return "exception";
  if (/(competência|competencia|responsabilidade)/iu.test(text)) {
    return "competence";
  }
  if (/(classifica|tipos?\s+de|categorias?)/iu.test(text)) {
    return "classification";
  }
  if (/(diferença|diferenca|compar)/iu.test(text)) return "comparison";
  if (/^(?:\d+[.)]\s)|(?:etapa|processo|sequência|sequencia)/iu.test(text)) {
    return "process";
  }
  if (/(^|\s)(se|caso|quando|somente|desde que)(\s|$)/iu.test(text)) {
    return "condition";
  }
  if (/(deve|deverá|devera|pode|é permitido|e permitido|obrigatóri)/iu.test(text)) {
    return "rule";
  }
  if (/(define|definição|definicao| significa | é | e )/iu.test(` ${text} `)) {
    return "definition";
  }
  return "statement";
}

function evidenceBlocks(markdown: string): EvidenceBlock[] {
  const newline = markdown.includes("\r\n") ? "\r\n" : "\n";
  const lines = markdown.split(/\r?\n/u);
  const blocks: EvidenceBlock[] = [];
  let heading: string | null = null;

  for (let index = 0; index < lines.length; ) {
    const line = lines[index] ?? "";
    const headingMatch = line.match(/^#{1,6}\s+(.+?)\s*$/u);
    if (headingMatch) {
      heading = headingMatch[1] ?? null;
      index += 1;
      continue;
    }
    if (line.trim().length === 0 || /^---\s*$/u.test(line)) {
      index += 1;
      continue;
    }

    if (/^\s*(`{3,}|~{3,})/u.test(line)) {
      const marker = line.trim().startsWith("~") ? "~" : "`";
      const collected = [line];
      index += 1;
      while (index < lines.length) {
        const current = lines[index] ?? "";
        collected.push(current);
        index += 1;
        if (new RegExp(`^\\s*${marker}{3,}\\s*$`, "u").test(current)) {
          break;
        }
      }
      blocks.push({ excerpt: collected.join(newline), heading, forcedType: "code" });
      continue;
    }

    if (/^\s*>\s*\[![A-Za-z0-9_-]+\]/u.test(line)) {
      const collected = [line];
      index += 1;
      while (index < lines.length && /^\s*>/u.test(lines[index] ?? "")) {
        collected.push(lines[index] ?? "");
        index += 1;
      }
      blocks.push({ excerpt: collected.join(newline), heading });
      continue;
    }

    if (
      line.includes("|") &&
      index + 1 < lines.length &&
      /^\s*\|?(?:\s*:?-{3,}:?\s*\|)+/u.test(lines[index + 1] ?? "")
    ) {
      const collected = [line, lines[index + 1] ?? ""];
      index += 2;
      while (
        index < lines.length &&
        (lines[index] ?? "").includes("|") &&
        (lines[index] ?? "").trim().length > 0
      ) {
        collected.push(lines[index] ?? "");
        index += 1;
      }
      blocks.push({ excerpt: collected.join(newline), heading });
      continue;
    }

    const collected = [line];
    index += 1;
    while (
      index < lines.length &&
      (lines[index] ?? "").trim().length > 0 &&
      !/^#{1,6}\s+/u.test(lines[index] ?? "") &&
      !/^\s*(`{3,}|~{3,})/u.test(lines[index] ?? "") &&
      !/^\s*>\s*\[![A-Za-z0-9_-]+\]/u.test(lines[index] ?? "")
    ) {
      collected.push(lines[index] ?? "");
      index += 1;
    }
    const excerpt = collected.join(newline);
    blocks.push({
      excerpt,
      heading,
      forcedType: /\$[^$]+\$|\$\$[\s\S]*\$\$/u.test(excerpt)
        ? "formula"
        : undefined
    });
  }
  return blocks.filter((block) => block.excerpt.trim().length > 0);
}

function routeClaims(claims: EvidenceClaim[], type: ClaimType): EvidenceClaim[] {
  return claims.filter((claim) => claim.type === type);
}

export function extractContentModel(
  source: EvidenceSource,
  markdown: string,
  profile: DidacticProfile
): ContentModel {
  const blocks = evidenceBlocks(markdown);
  const claims = blocks.map<EvidenceClaim>((block, index) => ({
    id: `claim-${String(index + 1).padStart(3, "0")}`,
    type: claimType(block.excerpt, block.forcedType),
    statement: block.excerpt,
    sourceId: source.id,
    sourcePath: source.path,
    sourceHeading: block.heading,
    sourceExcerpt: block.excerpt,
    sourceRegion: null,
    confidence: 1,
    status: "supported"
  }));
  const topic =
    source.markdown.headings.find((heading) => heading.level === 1)?.text ??
    path.posix.basename(source.path, path.posix.extname(source.path));

  return {
    topic,
    profile,
    claims,
    definitions: routeClaims(claims, "definition"),
    rules: routeClaims(claims, "rule"),
    conditions: routeClaims(claims, "condition"),
    exceptions: routeClaims(claims, "exception"),
    prohibitions: routeClaims(claims, "prohibition"),
    competences: routeClaims(claims, "competence"),
    classifications: routeClaims(claims, "classification"),
    comparisons: routeClaims(claims, "comparison"),
    processes: routeClaims(claims, "process"),
    examples: routeClaims(claims, "example"),
    counterexamples: routeClaims(claims, "counterexample"),
    examTraps: routeClaims(claims, "exam-trap"),
    formulas: routeClaims(claims, "formula"),
    variables: [],
    codeBlocks: routeClaims(claims, "code"),
    questions: routeClaims(claims, "question"),
    conflicts: [],
    gaps: []
  };
}
