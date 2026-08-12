#!/usr/bin/env node

import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { vendorFileEvidence } from "./vendor-integrity.mjs";

const packageRoot = path.resolve(import.meta.dirname, "..");
const vendorRoot = path.join(packageRoot, "vendor", "bmad");
const output = path.join(vendorRoot, "VENDOR_MANIFEST.json");
const files = [];

for (const file of await walk(vendorRoot)) {
  const relative = path.relative(vendorRoot, file).replaceAll("\\", "/");
  if (relative === "VENDOR_MANIFEST.json") continue;
  const content = await readFile(file);
  files.push({ path: relative, ...vendorFileEvidence(content) });
}

files.sort((left, right) => left.path.localeCompare(right.path));
await writeFile(output, `${JSON.stringify({ algorithm: "sha256", files }, null, 2)}\n`, "utf8");
process.stdout.write(`Generated ${path.relative(packageRoot, output)} with ${files.length} files.\n`);

async function walk(root) {
  const result = [];
  for (const entry of await readdir(root, { withFileTypes: true })) {
    const target = path.join(root, entry.name);
    if (entry.isDirectory()) result.push(...await walk(target));
    else if (entry.isFile()) result.push(target);
  }
  return result;
}
