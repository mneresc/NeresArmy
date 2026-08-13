#!/usr/bin/env node
import path from "node:path";
import { validateClaudeBundle } from "./claude-bundle.mjs";
const bundleRoot = path.resolve(import.meta.dirname, "..");
const result = await validateClaudeBundle({ bundleRoot });
if (!result.valid) { process.stderr.write(`${result.diagnostics.join("\n")}\n`); process.exit(1); }
process.stdout.write(`Validated 4 entry agents and 11 subagents for Claude Code.\n`);
