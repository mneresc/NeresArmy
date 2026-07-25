import { access, cp, mkdir, rm } from "node:fs/promises";
import path from "node:path";

import { discoverSkills, validateSkills } from "./catalog.mjs";

const EXCLUDED_DIRECTORIES = new Set(["src", "tests", "coverage", "node_modules"]);

async function exists(target) {
  try {
    await access(target);
    return true;
  } catch {
    return false;
  }
}

function installedFilesOnly(sourceRoot) {
  return (source) => {
    const relative = path.relative(sourceRoot, source);
    const first = relative.split(path.sep)[0];
    return !EXCLUDED_DIRECTORIES.has(first);
  };
}

export async function installSkills({ repositoryRoot, destination, selected, force = false, dryRun = false }) {
  const validation = await validateSkills(repositoryRoot);
  if (!validation.valid) throw new Error(validation.diagnostics.join("\n"));
  const allSkills = await discoverSkills(repositoryRoot);
  const selectedSkills = selected === "all"
    ? allSkills
    : allSkills.filter((skill) => selected.includes(skill.slug));
  const found = new Set(selectedSkills.map((skill) => skill.slug));
  const missing = selected === "all" ? [] : selected.filter((slug) => !found.has(slug));
  if (missing.length > 0) throw new Error(`Unknown skill: ${missing.join(", ")}.`);

  const installed = [];
  for (const skill of selectedSkills) {
    const target = path.join(destination, skill.slug);
    if (dryRun) {
      installed.push(target);
      continue;
    }
    if (await exists(target)) {
      if (!force) throw new Error(`Destination already exists: ${target}. Use --force to replace it.`);
      await rm(target, { recursive: true, force: true });
    }
    await mkdir(destination, { recursive: true });
    await cp(skill.directory, target, { recursive: true, filter: installedFilesOnly(skill.directory) });
    installed.push(target);
  }
  return installed;
}
