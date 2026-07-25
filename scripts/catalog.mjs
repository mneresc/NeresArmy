import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const REQUIRED_FILES = ["SKILL.md", "README.md", "docs/COOKBOOK.md", "catalog.json"];
const LOCAL_PATH_PATTERN = /(?:^|[^A-Za-z0-9_])[A-Za-z]:[\\/]/m;

function frontmatter(source) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!match) return {};
  return Object.fromEntries(match[1]
    .split(/\r?\n/)
    .map((line) => line.match(/^([A-Za-z][A-Za-z0-9_-]*):\s*(.+?)\s*$/))
    .filter(Boolean)
    .map(([, key, value]) => [key, value.replace(/^['"]|['"]$/g, "")]));
}

async function readSkill(repositoryRoot, slug) {
  const directory = path.join(repositoryRoot, "skills", slug);
  const [skillSource, catalogSource] = await Promise.all([
    readFile(path.join(directory, "SKILL.md"), "utf8"),
    readFile(path.join(directory, "catalog.json"), "utf8")
  ]);
  const metadata = frontmatter(skillSource);
  const catalog = JSON.parse(catalogSource);
  return {
    slug,
    directory,
    name: metadata.name,
    description: metadata.description,
    category: catalog.category,
    status: catalog.status,
    invocation: catalog.invocation,
    npmPackage: catalog.npmPackage ?? null
  };
}

export async function skillDirectories(repositoryRoot) {
  const root = path.join(repositoryRoot, "skills");
  const entries = await readdir(root, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isDirectory() && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(entry.name))
    .map((entry) => entry.name)
    .sort((left, right) => left.localeCompare(right));
}

export async function discoverSkills(repositoryRoot) {
  return Promise.all((await skillDirectories(repositoryRoot))
    .map((slug) => readSkill(repositoryRoot, slug)));
}

async function exists(file) {
  try {
    await readFile(file);
    return true;
  } catch {
    return false;
  }
}

export async function validateSkills(repositoryRoot) {
  const diagnostics = [];
  const slugs = await skillDirectories(repositoryRoot);
  if (slugs.length === 0) diagnostics.push("No canonical skills found in skills/<slug>.");

  for (const slug of slugs) {
    const directory = path.join(repositoryRoot, "skills", slug);
    for (const relative of REQUIRED_FILES) {
      if (!(await exists(path.join(directory, relative)))) {
        diagnostics.push(`${slug}: missing ${relative}.`);
      }
    }
    if (diagnostics.some((diagnostic) => diagnostic.startsWith(`${slug}: missing`))) continue;

    let skill;
    try {
      skill = await readSkill(repositoryRoot, slug);
    } catch (error) {
      diagnostics.push(`${slug}: invalid metadata (${error instanceof Error ? error.message : "unknown error"}).`);
      continue;
    }
    if (skill.name !== slug) diagnostics.push(`${slug}: SKILL.md name must match the directory name.`);
    if (!skill.description) diagnostics.push(`${slug}: SKILL.md description is required.`);
    if (!skill.category || !skill.status || !skill.invocation) {
      diagnostics.push(`${slug}: catalog.json requires category, status, and invocation.`);
    }

    for (const relative of ["SKILL.md", "README.md", "docs/COOKBOOK.md"]) {
      const source = await readFile(path.join(directory, relative), "utf8");
      if (LOCAL_PATH_PATTERN.test(source)) {
        diagnostics.push(`${slug}: ${relative} contains a local path; use a placeholder instead.`);
      }
    }
  }

  const valid = diagnostics.length === 0;
  return { valid, diagnostics, skills: valid ? await discoverSkills(repositoryRoot) : [] };
}

function cell(value) {
  return String(value).replaceAll("|", "\\|").replaceAll("\n", " ");
}

export function renderCatalog(skills) {
  const rows = skills.map((skill) => [
    `[${skill.slug}](../skills/${skill.slug}/README.md)`,
    cell(skill.description),
    cell(skill.category),
    cell(skill.status),
    `\`npx skills@latest add mneresc/NeresArmy --skill ${skill.slug}\``
  ]);
  return [
    "# Catálogo de skills",
    "",
    "Este arquivo é gerado por `npm run generate:catalog`. Não o edite manualmente.",
    "",
    "| Skill | Descrição | Categoria | Estado | Instalação individual |",
    "| --- | --- | --- | --- | --- |",
    ...rows.map((row) => `| ${row.join(" | ")} |`),
    ""
  ].join("\n");
}
