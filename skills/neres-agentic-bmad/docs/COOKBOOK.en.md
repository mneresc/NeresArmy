# Cookbook — Neres Agentic BMAD

[Português](COOKBOOK.md) · [English](COOKBOOK.en.md) · [Español](COOKBOOK.es.md)

- Interactive install: `npx -y @mneresc/neres-agentic-bmad`.
- Preview: append `--dry-run` to an explicit client command.
- Managed update: inspect preview, then append `--force`; read the reported backup.
- Claude Code: `install claude-code --scope project`, then `claude --agent neres-planner`.
- Existing BMAD: preserved when `_bmad/_config/manifest.yaml` exists.
- Partial BMAD: restore or remove the partial `_bmad` and `bmad-*` skills; force
  intentionally does not merge installations.
- Model error: inspect the client's real model inventory; never use a marketing
  name as an unverified ID.
- Missing agent: inspect the native agent/skill directories and restart clients
  that load agents only at session start.
- After two failed attempts, stop and return the decisive evidence for escalation.

The installer never edits base settings, credentials or MCP configuration.
