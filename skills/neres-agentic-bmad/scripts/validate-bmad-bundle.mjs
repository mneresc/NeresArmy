#!/usr/bin/env node
import path from "node:path";
import { validateBundledBmad } from "./bmad-bundle.mjs";
const bundleRoot = path.resolve(import.meta.dirname, "..");
const result = await validateBundledBmad({ bundleRoot });
if (!result.valid) { process.stderr.write(`${result.diagnostics.join("\n")}\n`); process.exit(1); }
process.stdout.write(`Validated bundled BMAD 6.11.0 with ${result.skillCount} skills.\n`);
