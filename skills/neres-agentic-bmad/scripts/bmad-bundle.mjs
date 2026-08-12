import { access, cp, mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

import { vendorFileEvidence } from "./vendor-integrity.mjs";

export const BMAD_VERSION = "6.11.0";

export async function validateBundledBmad({ bundleRoot }) {
  const root = path.join(bundleRoot, "vendor", "bmad");
  const diagnostics = [];
  const provenance = await json(path.join(root, "PROVENANCE.json"), diagnostics);
  const manifest = await json(path.join(root, "VENDOR_MANIFEST.json"), diagnostics);
  const skillsRoot = path.join(root, "skills");
  const skills = await directories(skillsRoot, diagnostics);
  const cachedFiles = (await walk(root)).filter((file) => file.endsWith(".pyc") || file.includes(`${path.sep}__pycache__${path.sep}`));

  if (provenance?.version !== BMAD_VERSION) diagnostics.push(`BMAD provenance must pin ${BMAD_VERSION}.`);
  if (provenance?.license !== "MIT") diagnostics.push("BMAD provenance must declare MIT.");
  if (skills.length !== 49 || skills.some((name) => !name.startsWith("bmad-"))) {
    diagnostics.push("Bundled BMAD must contain exactly 49 bmad-* skills.");
  }
  if (!(await exists(path.join(root, "_bmad", "_config", "manifest.yaml")))) {
    diagnostics.push("Bundled BMAD core manifest is missing.");
  }
  if (!(await exists(path.join(root, "LICENSE")))) diagnostics.push("Bundled BMAD license is missing.");
  if (cachedFiles.length) diagnostics.push("Bundled BMAD cannot contain Python caches.");

  if (manifest?.files) {
    const expected = new Set(manifest.files.map((item) => item.path));
    const actual = (await walk(root))
      .map((file) => path.relative(root, file).replaceAll("\\", "/"))
      .filter((file) => file !== "VENDOR_MANIFEST.json");
    for (const file of actual) {
      if (!expected.has(file)) diagnostics.push(`Vendor manifest does not track: ${file}.`);
    }
    for (const file of expected) {
      if (!actual.includes(file)) diagnostics.push(`Vendor manifest lists an unexpected file: ${file}.`);
    }
    for (const item of manifest.files) {
      const file = path.join(root, item.path);
      if (!(await exists(file))) {
        diagnostics.push(`Vendor manifest file is missing: ${item.path}.`);
        continue;
      }
      const content = await readFile(file);
      const evidence = vendorFileEvidence(content);
      if (evidence.sha256 !== item.sha256 || evidence.size !== item.size) diagnostics.push(`Vendor integrity mismatch: ${item.path}.`);
    }
  }

  return { valid: diagnostics.length === 0, diagnostics, skillCount: skills.length, cachedFiles, skills };
}

export async function installBundledBmad({
  bundleRoot,
  projectRoot,
  skillRoot,
  dryRun = false,
  language = "en",
  skip = false
}) {
  if (skip) return { status: "skipped", version: null, core: null, skills: [] };
  const validation = await validateBundledBmad({ bundleRoot });
  if (!validation.valid) throw new Error(validation.diagnostics.join("\n"));

  const coreTarget = path.join(projectRoot, "_bmad");
  const manifestTarget = path.join(coreTarget, "_config", "manifest.yaml");
  const existingSkills = (await exists(skillRoot))
    ? (await readdir(skillRoot, { withFileTypes: true })).filter((entry) => entry.isDirectory() && entry.name.startsWith("bmad-"))
    : [];
  const existingSkillNames = existingSkills.map((entry) => entry.name).sort();
  const hasCompleteSkills = existingSkillNames.length === validation.skills.length
    && validation.skills.every((name, index) => name === existingSkillNames[index]);
  const hasCore = await exists(manifestTarget);
  if (hasCore) {
    const current = await readFile(manifestTarget, "utf8");
    const version = current.match(/version:\s*([^\s]+)/)?.[1] ?? "unknown";
    if (hasCompleteSkills) {
      return { status: "existing", version, core: coreTarget, skills: existingSkills.map((entry) => path.join(skillRoot, entry.name)) };
    }
    if (existingSkills.length) {
      throw new Error("Partial BMAD skills detected for this client. Restore or remove its bmad-* skill directories before retrying.");
    }
    if (version !== BMAD_VERSION) {
      throw new Error(`BMAD ${version} already exists, but this client has no BMAD skills. Install matching skills with that BMAD version before retrying.`);
    }
    const skillTargets = validation.skills.map((name) => path.join(skillRoot, name));
    if (dryRun) return { status: "would-extend", version, core: coreTarget, skills: skillTargets };
    await copySkills(bundleRoot, skillRoot, validation.skills);
    return { status: "extended", version, core: coreTarget, skills: skillTargets };
  }
  if (await exists(coreTarget) || existingSkills.length) {
    throw new Error("Partial BMAD installation detected. Restore or remove the partial _bmad and bmad-* skill directories before retrying.");
  }

  const skillTargets = validation.skills.map((name) => path.join(skillRoot, name));
  if (dryRun) return { status: "would-install", version: BMAD_VERSION, core: coreTarget, skills: skillTargets };

  const vendor = path.join(bundleRoot, "vendor", "bmad");
  try {
    await cp(path.join(vendor, "_bmad"), coreTarget, { recursive: true, force: false });
    await copySkills(bundleRoot, skillRoot, validation.skills);
    await configure(coreTarget, projectRoot, language);
  } catch (error) {
    await rm(coreTarget, { recursive: true, force: true });
    for (const target of skillTargets) await rm(target, { recursive: true, force: true });
    throw error;
  }
  return { status: "installed", version: BMAD_VERSION, core: coreTarget, skills: skillTargets };
}

async function copySkills(bundleRoot, skillRoot, skills) {
  await mkdir(skillRoot, { recursive: true });
  for (const name of skills) {
    const target = path.join(skillRoot, name);
    try {
      await cp(path.join(bundleRoot, "vendor", "bmad", "skills", name), target, { recursive: true, force: false });
    } catch (error) {
      for (const copied of skills.slice(0, skills.indexOf(name) + 1)) {
        await rm(path.join(skillRoot, copied), { recursive: true, force: true });
      }
      throw error;
    }
  }
}

async function configure(coreTarget, projectRoot, language) {
  const languages = { en: "English", pt: "Portuguese (Brazil)", es: "Spanish" };
  if (!languages[language]) throw new Error("language must be en, pt or es.");
  const projectName = path.basename(projectRoot).replaceAll('"', "");
  const toml = path.join(coreTarget, "config.toml");
  let source = await readFile(toml, "utf8");
  source = source.replace(/^project_name\s*=\s*"[^"]*"/m, `project_name = "${projectName}"`);
  source = source.replace(/^document_output_language\s*=\s*"[^"]*"/m, `document_output_language = "${languages[language]}"`);
  await writeFile(toml, source, "utf8");
  for (const relative of [path.join("core", "config.yaml"), path.join("bmm", "config.yaml")]) {
    const yaml = path.join(coreTarget, relative);
    let config = await readFile(yaml, "utf8");
    config = config.replace(/^project_name:\s*.*$/m, `project_name: ${projectName}`);
    config = config.replace(/^document_output_language:\s*.*$/m, `document_output_language: ${languages[language]}`);
    await writeFile(yaml, config, "utf8");
  }
}

async function json(file, diagnostics) {
  try { return JSON.parse(await readFile(file, "utf8")); }
  catch (error) { diagnostics.push(`Cannot read ${path.basename(file)}: ${message(error)}.`); return null; }
}

async function directories(root, diagnostics) {
  try { return (await readdir(root, { withFileTypes: true })).filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort(); }
  catch (error) { diagnostics.push(`Cannot read BMAD skills: ${message(error)}.`); return []; }
}

async function walk(root) {
  const result = [];
  for (const entry of await readdir(root, { withFileTypes: true })) {
    const target = path.join(root, entry.name);
    if (entry.isDirectory()) result.push(...await walk(target));
    else result.push(target);
  }
  return result;
}

async function exists(target) { try { await access(target); return true; } catch { return false; } }
function message(error) { return error instanceof Error ? error.message : "unknown error"; }
