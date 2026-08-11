# S14 Feature Intake — Neres Agentic BMAD for Codex

## Objective

Port the stable Neres Agentic BMAD architecture to Codex 0.146.1 while reusing
the shared protocol, BMAD integration, compact handoffs, deterministic gates and
safe installation behavior already delivered for OpenCode.

## Actors and entry points

- `neres-planner`: proportional BMAD planning without production edits.
- `neres-developer`: TaskPacket-driven implementation orchestration.
- `neres-quick-dev`: two-phase small-change flow with mandatory human gate.
- Eleven named Plan/Dev Nerinhos as project or global Codex custom agents.

## In scope

- Three native Codex profile files under `$CODEX_HOME`.
- Eleven valid custom-agent TOML files under `$CODEX_HOME/agents`.
- GPT-5.6 Sol/Terra/Luna routing plus explicit reasoning effort.
- Shared `neres-agentic-bmad` skill with progressive disclosure.
- Safe installer, backup, model/version validation and smoke instructions.
- Short operational documentation and repository catalog integration.

## Out of scope

- Updating Codex or BMAD.
- Reinstalling BMAD.
- Modifying the user's base `config.toml`, MCPs, plugins or approvals.
- Fixing unrelated malformed global agents.
- Commit, push, merge or npm publication.

## Constraints and verified environment

- Codex CLI 0.146.1; `multi_agent` stable.
- Models available: `gpt-5.6-sol`, `gpt-5.6-terra`, `gpt-5.6-luna`.
- Custom agents require `name`, `description`, `developer_instructions`.
- Profiles are `$CODEX_HOME/<name>.config.toml` selected with `--profile`.
- BMAD 6.10.0 remains the planning source of truth.
- Subagents inherit live parent sandbox/approval overrides; documentation must
  not promise stronger isolation than the runtime can enforce.

## Risks

- Static TOML cannot compile a dynamic TaskPacket file allowlist.
- Profile entry points are CLI-selectable; the desktop app does not expose them
  as OpenCode-style primary-agent menu items.
- Existing global `danger-full-access`/`never` defaults are user-owned; profiles
  must strengthen them without editing the base file.
- Existing malformed custom agents cause doctor warnings independent of S14.

## Approval

The current request explicitly says to implement now. It authorizes GREEN after
BDD, RED and technical planning, but explicitly forbids commit and push.
