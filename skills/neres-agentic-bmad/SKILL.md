---
name: neres-agentic-bmad
description: Install, validate, operate, and troubleshoot the Neres multi-agent architecture for Codex, OpenCode or Devin CLI/Desktop. Use for Neres entry points, specialized subagents, adaptive model routing, capability discovery, MCP/skill preference, least privilege, compact handoffs, deterministic gates, BMAD workflows, Devin equivalents, installation or smoke tests.
---

# Neres Agentic BMAD

## Purpose

Install and operate native Codex, OpenCode or Devin entry points backed by eleven
specialized subagents. Preserve installed BMAD workflows as the planning source of
truth. Use compact contracts, deterministic tools and independent review to reduce
cost and context growth.

Always read
`assets/opencode/skills/agentic-bmad/references/capabilities.md` before selecting
skills, MCPs or local tools. Prefer relevant healthy capabilities in the current
environment without assuming a personal provider, server or skill exists.

Read the shared contracts under
`assets/opencode/skills/agentic-bmad/references/` only as needed. For Codex, also
read [runtime.md](assets/codex/skills/neres-agentic-bmad/references/runtime.md).
Read [quick-dev.md](assets/codex/skills/neres-agentic-bmad/references/quick-dev.md)
only when using `neres-quick-dev`.

## Install Codex safely

1. Confirm Codex and BMAD are installed; never update or reinstall them here.
2. Run `codex --version`, `codex debug models` and `codex doctor --json`.
3. Preview with `node scripts/install-codex.mjs --dry-run`.
4. Install with `node scripts/install-codex.mjs`.
5. Existing managed names require `--force`, which creates a recoverable backup.
6. Never edit the user's base `config.toml`; install only three profile files,
   eleven custom agents and this skill.

Invoke the native entry points with:

```text
codex --profile neres-planner
codex --profile neres-developer
codex --profile neres-quick-dev
```

## Install OpenCode safely

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

## Install Devin safely

1. On the target work machine, run `devin --version`, `devin models list --format
   json`, `devin skills list` and `devin mcp list`. Never install/update Devin here.
2. Preview a repository installation with `node scripts/install-devin.mjs --target
   project --dry-run` or a user installation with `--target user --dry-run`.
3. Project mode writes only `.agents/skills` and `.agents/agents`; user mode writes
   only the Devin user `skills` and `agents` directories.
4. Existing managed names require `--force`, which creates a recoverable backup.
5. Never edit Devin config, MCP configuration, credentials or organization policy.

## Validate Codex

Run:

```text
node scripts/validate-codex-bundle.mjs
codex --profile neres-planner exec --ephemeral --skip-git-repo-check "Reply PROFILE_OK only."
codex --profile neres-developer exec --ephemeral --skip-git-repo-check "Reply PROFILE_OK only."
codex --profile neres-quick-dev exec --ephemeral --skip-git-repo-check "Reply PROFILE_OK only."
codex doctor --json
```

The bundle validator strictly parses the managed TOMLs. A live
`--strict-config` smoke is optional and also validates the user's unrelated base
configuration; report pre-existing failures there without rewriting that file.

Treat a warning naming a Neres TOML, an unavailable model, wrong effort, wrong
sandbox or a changed base config as a blocker. Pre-existing warnings outside the
managed names must be reported but not silently fixed.

## Validate OpenCode

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

## Validate Devin

Run the static bundle validation anywhere:

```text
node scripts/validate-devin-bundle.mjs
node scripts/install-devin.mjs --target project --dry-run
```

On the authenticated work machine, also run `devin models list --format json`,
`devin skills list` and `devin mcp list`, then smoke the three entry skills in a
safe repository. Do not install or authenticate Devin on a personal environment
for this validation.

## Operate

- Use `neres-planner` for intake, proportional BMAD planning and TaskPackets.
- Use `neres-developer` only after a BMAD story/spec and TaskPackets are ready.
- Use `neres-quick-dev` only for a tiny/small local low-risk change. It must stop
  after QuickPlan until a later explicit authorization.
- Let entry points call specialized subagents. Do not select workers normally.
- Build a CapabilityMap and prefer suitable healthy MCPs and installed skills.
- Codex and OpenCode keep BMAD as the workflow source of truth; supporting skills
  may accelerate its phases. Only Devin may substitute outcome-equivalent skills
  when BMAD is unavailable, using the bundled fallback for remaining gaps.
- Require T0 tools for tests, lint, typecheck, build, search and diffs.
- Pass ContextPack and reports instead of full files, logs or agent history.
- Escalate after two failed attempts or immediately for newly discovered critical
  architecture, security, concurrency, migration or contract risk.

## Troubleshoot

Read [the usage guide](docs/USAGE.md) for client-specific invocation and examples.
Read [the cookbook](docs/COOKBOOK.md) for discovery, overwrite, model and smoke-test
failures. Do not duplicate the shared protocol into profiles, agents, AGENTS.md or
project documentation.
