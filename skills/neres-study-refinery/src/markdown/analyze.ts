import type {
  MarkdownAnalysis,
  MarkdownCallout,
  MarkdownCodeBlock,
  MarkdownFormula,
  MarkdownTable
} from "../contracts.ts";
import { findObsidianEmbeds } from "./embeds.ts";

const TABLE_DELIMITER = /^\s*\|?(?:\s*:?-{3,}:?\s*\|)+\s*:?-{3,}:?\s*\|?\s*$/u;
const FENCE_START = /^\s*(`{3,}|~{3,})(.*)$/u;

function unique(values: string[]): string[] {
  return [...new Set(values)];
}

function tableCells(line: string): string[] {
  const trimmed = line.trim().replace(/^\|/u, "").replace(/\|$/u, "");
  return trimmed.split("|").map((cell) => cell.trim());
}

function collectCodeBlock(
  lines: string[],
  startIndex: number,
  marker: string,
  info: string
): { block: MarkdownCodeBlock; nextIndex: number } {
  const collected = [lines[startIndex] ?? ""];
  let index = startIndex + 1;
  while (index < lines.length) {
    const line = lines[index] ?? "";
    collected.push(line);
    if (new RegExp(`^\\s*${marker[0]}{${marker.length},}\\s*$`, "u").test(line)) {
      break;
    }
    index += 1;
  }
  const content = collected.slice(1, -1).join("\n");
  return {
    block: {
      language: info.trim().split(/\s+/u)[0] || null,
      content,
      raw: collected.join("\n"),
      startLine: startIndex + 1,
      endLine: Math.min(index + 1, lines.length)
    },
    nextIndex: index
  };
}

function collectTable(
  lines: string[],
  startIndex: number
): { table: MarkdownTable; nextIndex: number } {
  const collected = [lines[startIndex] ?? "", lines[startIndex + 1] ?? ""];
  let index = startIndex + 2;
  while (index < lines.length && (lines[index] ?? "").includes("|")) {
    const line = lines[index] ?? "";
    if (line.trim().length === 0) {
      break;
    }
    collected.push(line);
    index += 1;
  }
  return {
    table: {
      headers: tableCells(collected[0] ?? ""),
      rows: collected.slice(2).map(tableCells),
      raw: collected.join("\n"),
      startLine: startIndex + 1,
      endLine: startIndex + collected.length
    },
    nextIndex: startIndex + collected.length - 1
  };
}

function collectCallout(
  lines: string[],
  startIndex: number,
  type: string,
  title: string
): { callout: MarkdownCallout; nextIndex: number } {
  const collected = [lines[startIndex] ?? ""];
  let index = startIndex + 1;
  while (index < lines.length && /^\s*>/u.test(lines[index] ?? "")) {
    collected.push(lines[index] ?? "");
    index += 1;
  }
  return {
    callout: {
      type: type.toLocaleLowerCase("en-US"),
      title: title.trim() || null,
      content: collected
        .slice(1)
        .map((line) => line.replace(/^\s*>\s?/u, ""))
        .join("\n"),
      raw: collected.join("\n"),
      startLine: startIndex + 1,
      endLine: startIndex + collected.length
    },
    nextIndex: startIndex + collected.length - 1
  };
}

function collectFormulas(line: string, lineNumber: number): MarkdownFormula[] {
  const formulas: MarkdownFormula[] = [];
  for (const match of line.matchAll(/\$\$([^$]+)\$\$/gu)) {
    formulas.push({
      content: (match[1] ?? "").trim(),
      display: true,
      raw: match[0],
      startLine: lineNumber,
      endLine: lineNumber
    });
  }
  for (const match of line.matchAll(/(?<!\$)\$([^$\n]+)\$(?!\$)/gu)) {
    formulas.push({
      content: (match[1] ?? "").trim(),
      display: false,
      raw: match[0],
      startLine: lineNumber,
      endLine: lineNumber
    });
  }
  return formulas;
}

export function analyzeMarkdown(markdown: string): MarkdownAnalysis {
  const lines = markdown.replace(/\r\n?/gu, "\n").split("\n");
  const analysis: MarkdownAnalysis = {
    headings: [],
    tables: [],
    codeBlocks: [],
    formulas: [],
    callouts: [],
    links: [],
    wikilinks: [],
    embeds: findObsidianEmbeds(markdown)
  };

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index] ?? "";
    const fence = line.match(FENCE_START);
    if (fence) {
      const collected = collectCodeBlock(
        lines,
        index,
        fence[1] ?? "```",
        fence[2] ?? ""
      );
      analysis.codeBlocks.push(collected.block);
      index = collected.nextIndex;
      continue;
    }

    const heading = line.match(/^(#{1,6})\s+(.+?)\s*$/u);
    if (heading) {
      analysis.headings.push({
        level: (heading[1] ?? "").length,
        text: heading[2] ?? "",
        line: index + 1
      });
    }

    if (
      line.includes("|") &&
      index + 1 < lines.length &&
      TABLE_DELIMITER.test(lines[index + 1] ?? "")
    ) {
      const collected = collectTable(lines, index);
      analysis.tables.push(collected.table);
      index = collected.nextIndex;
      continue;
    }

    const callout = line.match(/^\s*>\s*\[!([A-Za-z0-9_-]+)\][+-]?\s*(.*)$/u);
    if (callout) {
      const collected = collectCallout(
        lines,
        index,
        callout[1] ?? "note",
        callout[2] ?? ""
      );
      analysis.callouts.push(collected.callout);
      index = collected.nextIndex;
      continue;
    }

    analysis.formulas.push(...collectFormulas(line, index + 1));
  }

  for (const match of markdown.matchAll(/(?<!!)\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/gu)) {
    if (match[1]) {
      analysis.links.push(match[1]);
    }
  }
  for (const match of markdown.matchAll(/(?<!!)\[\[([^\]]+)\]\]/gu)) {
    const target = (match[1] ?? "").split("|", 1)[0]?.split("#", 1)[0]?.trim();
    if (target) {
      analysis.wikilinks.push(target);
    }
  }
  analysis.links = unique(analysis.links);
  analysis.wikilinks = unique(analysis.wikilinks);
  analysis.embeds = unique(analysis.embeds);
  return analysis;
}
