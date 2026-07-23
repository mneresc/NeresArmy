const EMBED_PATTERN = /!\[\[([^\]]+)\]\]/gu;

export function findObsidianEmbeds(markdown: string): string[] {
  const targets: string[] = [];
  for (const match of markdown.matchAll(EMBED_PATTERN)) {
    const raw = match[1];
    if (!raw) {
      continue;
    }
    const withoutAlias = raw.split("|", 1)[0] ?? "";
    const withoutFragment = withoutAlias.split("#", 1)[0]?.trim() ?? "";
    if (withoutFragment.length > 0) {
      targets.push(withoutFragment);
    }
  }
  return targets;
}
