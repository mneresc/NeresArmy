# GREEN report — S14 Codex port

Date: 2026-08-11

## Automated evidence

- `node --test skills/neres-agentic-bmad/tests/*.test.mjs`: 10 passed, 0 failed.
- Live model inventory validation: 3 profiles and 11 agents accepted by Codex CLI 0.146.1.
- `quick_validate.py skills/neres-agentic-bmad`: pass.
- `npm run check`: pass outside the filesystem sandbox. The first sandboxed run
  passed all tests but the unrelated study-refinery esbuild step could not read
  an ancestor directory; the identical unrestricted run built successfully.
- Repository totals included 3 root Node tests, 10 agentic-bmad tests, 69 Vitest
  tests and 38 Python tests, all green.

## Live smoke evidence

- `neres-planner`: ran as `gpt-5.6-terra`, medium effort, read-only; delegated
  to `plan-nerinhos-subagent-reader`; returned ContextPack and TaskPacket; no edit.
- `neres-quick-dev`: ran as `gpt-5.6-terra`, low effort; delegated to
  `dev-nerinhos-subagent-reader`; returned QuickPlan and stopped at the explicit
  human gate. SHA-256 of the target remained unchanged.
- `neres-developer`: ran as `gpt-5.6-terra`, medium effort; delegated bounded
  coding, testing and QA; changed only `src/increment.mjs`; `npm test` moved from
  0/1 to 1/1 passing.

## Environment observations

- `codex --strict-config` is currently blocked by the pre-existing
  `network_access` field in the user's base config. The managed TOMLs passed the
  bundle parser and real profile execution; the base config was not modified.
- Three unrelated existing custom agents (`file-reader`, `lint-checker`, and
  `test-runner`) remain malformed and are ignored by Codex. Neres roles loaded.
- Some unrelated configured MCP/plugin/model-cache warnings appeared during
  smoke tests; none prevented the three Neres flows.
- Final unrestricted `codex doctor --summary`: 15 checks OK, 0 failures; auth,
  nine MCP servers, WebSocket and provider reachability were healthy. It retained
  only pre-existing config/sandbox and rollout-scan warnings.
- Final synchronization created the recoverable backup
  `C:\Users\marce\.codex\backups\neres-agentic-bmad-codex-20260811T101340046Z`.

Result: GREEN for the managed Codex bundle and runtime workflows.
