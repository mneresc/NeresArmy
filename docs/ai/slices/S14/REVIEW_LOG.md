# Review log — S14 Codex port

Date: 2026-08-11

## Scope and contracts

- Three native Codex profile entry points are present.
- Eleven named custom agents match the requested planning/development roles.
- Shared BMAD contracts remain canonical and are reused from the OpenCode bundle.
- No Codex/BMAD update, dependency addition, base-config edit, commit or push.

## Safety review

- Planner and read/review roles are read-only.
- Writer/coder/mechanical/test roles use workspace-write only where required.
- Installer refuses managed-name conflicts unless `--force` is explicit and
  creates a timestamped recoverable backup before replacement.
- Automated tests prove unrelated files and base `config.toml` are preserved.
- TaskPacket `allowed_files` is enforced contractually and verified by diff,
  because current static Codex agent TOML cannot compile dynamic per-task paths
  into sandbox policy.

## Runtime corrections from smoke testing

- Profiles are runtime entry points; custom-agent TOMLs are delegated roles.
- Named-role spawns must use `fork_turns="none"`; full-history forks inherit the
  parent role. Profile instructions and runtime documentation now state this.
- Profile validation uses actual `codex --profile ... exec` smoke tests. `doctor`
  is a separate global audit, and strict mode may surface unrelated base-config
  incompatibilities.

## Decision

PASS. The Codex port is ready for local use. Remote publication is intentionally
not performed because this request explicitly forbids commit and push.
