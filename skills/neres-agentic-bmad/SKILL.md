---
name: neres-agentic-bmad
description: Install, validate, operate, and troubleshoot the Neres multi-agent BMAD architecture for OpenCode. Use when setting up neres-planner, neres-developer, their specialized hidden subagents, the shared agentic-bmad protocol, model-tier routing, least-privilege permissions, ContextPack/TaskPacket handoffs, deterministic gates, or OpenCode discovery and smoke tests.
---

# Neres Agentic BMAD

## Purpose

Install and operate two primary OpenCode orchestrators backed by eleven specialized
subagents. Preserve installed BMAD workflows as the planning source of truth. Use
compact contracts, deterministic tools and independent review to reduce cost and
context growth.

## Install safely

1. Confirm OpenCode and BMAD are already installed; never reinstall or update them
   as part of this skill.
2. Run `opencode --version` and `opencode models`. Do not invent model IDs.
3. Preview changes:

   ```text
   node scripts/install-opencode.mjs --dry-run
   ```

4. Install only after the preview is correct:

   ```text
   node scripts/install-opencode.mjs
   ```

5. If a managed destination exists, inspect it first. Use `--force` only for a
   conscious update; the installer creates a recoverable backup.
6. Do not edit `opencode.jsonc`. The installer writes only Markdown agents and the
   shared protocol skill.

## Validate

Run:

```text
node scripts/validate-opencode-bundle.mjs
opencode agent list
opencode debug agent neres-planner
opencode debug agent neres-developer
opencode debug skill
```

Treat syntax, missing models, wrong modes, permissions, task allowlists or missing
protocol files as blockers.

## Operate

- Select `neres-planner` for intake, proportional BMAD planning and TaskPackets.
- Select `neres-developer` only after a BMAD story/spec and TaskPackets are ready.
- Let primaries call hidden subagents. Do not select workers for normal usage.
- Require T0 tools for tests, lint, typecheck, build, search and diffs.
- Pass ContextPack and reports instead of full files, logs or agent history.
- Escalate after two failed attempts or immediately for newly discovered critical
  architecture, security, concurrency, migration or contract risk.

## Troubleshoot

Read [the cookbook](docs/COOKBOOK.md) for discovery, overwrite, model and smoke-test
failures. Read the installed `agentic-bmad` references only when operating the
workflow; do not duplicate them into prompts or project documentation.
