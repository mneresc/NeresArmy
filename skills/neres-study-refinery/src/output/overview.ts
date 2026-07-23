import path from "node:path";

export interface OverviewEntry {
  targetPath: string;
  title: string;
}

export function renderOverview(
  outputRoot: string,
  entries: readonly OverviewEntry[]
): string {
  const collator = new Intl.Collator("pt-BR", {
    numeric: true,
    sensitivity: "base"
  });
  const sorted = [...entries].sort((left, right) =>
    collator.compare(
      path.relative(outputRoot, left.targetPath),
      path.relative(outputRoot, right.targetPath)
    )
  );
  const links = sorted.map((entry) => {
    const relative = path
      .relative(outputRoot, entry.targetPath)
      .split(path.sep)
      .join("/")
      .replace(/\.md$/iu, "");
    return `- [[${relative}]] — ${entry.title}`;
  });
  return [
    "---",
    "type: study-overview-v2",
    "generated-from-vault-only: true",
    'generated-at: ""',
    "---",
    "",
    "# Visão Geral",
    "",
    ...links
  ].join("\n") + "\n";
}
