# S14 Implementation Plan

## Smallest correct diff

1. Add `assets/codex/profiles` with three native config profiles.
2. Add `assets/codex/agents` with eleven current-schema custom agents.
3. Extend the shared skill with Codex entrypoint, quick-dev and runtime guidance
   while reusing the existing protocol contracts.
4. Add `codex-bundle.mjs`, runtime inventory, installer and validator scripts.
5. Update package checks, README, cookbook, compatibility, catalog and the short
   `docs/neres-agentic-codex.md` guide.
6. Move RED to GREEN, run skill validation and full repository gates.
7. Install globally with backup, then run planner/developer/quick-dev smokes.

## Runtime decisions

- Profiles are the three explicitly selectable primary entry points because
  Codex custom-agent TOMLs define spawned agents, not OpenCode-style primaries.
- Profiles use `approval_policy = "on-request"`; planner is `read-only`, while
  developer and quick-dev are `workspace-write`.
- Profiles cap `agents.max_concurrent_threads_per_session` at six without
  changing the user's base config.
- Static custom agents use the cheapest normal tier. High-risk escalation uses
  explicit spawn overrides where the runtime supports them.
- Do not add project AGENTS.md rules: the shared skill and profile instructions
  already provide the behavior without enlarging every repository prompt.

## Likely files

- `skills/neres-agentic-bmad/assets/codex/**`
- `skills/neres-agentic-bmad/scripts/codex-*.mjs`
- `skills/neres-agentic-bmad/tests/codex-bundle.test.mjs`
- `skills/neres-agentic-bmad/SKILL.md`, README, cookbook and package metadata
- `docs/neres-agentic-codex.md`, compatibility/catalog and S14 reports

## Validation

- Focused Node contract tests.
- `quick_validate.py` and `npm run check`.
- Live profile execution through `codex --profile <entry> exec --ephemeral`, followed by a separate global `doctor` audit; the bundle validator owns strict parsing of managed TOMLs.
- Safe three-entrypoint smoke matrix.

## Gate

Human approval is already explicit in the current request. No commit or push is
authorized.
