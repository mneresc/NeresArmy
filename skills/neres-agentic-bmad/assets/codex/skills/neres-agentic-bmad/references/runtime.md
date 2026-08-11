# Codex runtime

## Native surfaces

- Profiles are primary entry points selected with `codex --profile <name>`.
- TOMLs under `$CODEX_HOME/agents` are spawned custom agents, not primary menus.
- Custom agents require `name`, `description` and `developer_instructions`.
- `model`, `model_reasoning_effort` and `sandbox_mode` are independent settings.
- Live parent sandbox and approval overrides can supersede a child file.
- Select named custom roles with `fork_turns="none"`; a full-history fork
  inherits the parent agent type and cannot switch to the requested role.
- Build the shared CapabilityMap first. Prefer relevant available MCPs and skills,
  but never assume personal names, install/authenticate integrations or replace a
  deterministic repository gate with a less authoritative result.

## Default routing

| Work | Model | Effort |
| --- | --- | --- |
| Search, read, mechanical and test orchestration | `gpt-5.6-luna` | low |
| Daily orchestration, coding, QA and normal audit | `gpt-5.6-terra` | low/medium |
| Architecture | `gpt-5.6-sol` | high |
| Demonstrated high-risk security/audit | explicit Sol respawn | high/xhigh |

Use deterministic commands for search, tests, lint, typecheck, build and diff.
Use explicit spawn overrides only after the escalation criteria in the shared
routing reference are met.

## Sandbox boundary

Static TOML can set a role-level sandbox but cannot compile every dynamic
TaskPacket into filesystem policy. Enforce `allowed_files` in the prompt and verify
the resulting diff. Stop when a forbidden file is needed.

Profiles use a maximum of six concurrent subagents. Prefer fewer when work is not
independent. Do not add a global `[agents]` section or modify the user's base config.
