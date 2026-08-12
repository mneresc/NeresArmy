# Usage guide — Neres Agentic BMAD

[Português](USAGE.md) · [English](USAGE.en.md) · [Español](USAGE.es.md)

## Installation

Run `npx -y @mneresc/neres-agentic-bmad` to select one or multiple clients. For
automation, run `install codex`, `install opencode`, `install devin --scope
project`, or `install claude-code --scope project`. Add `--dry-run` first.

The package carries BMAD 6.11.0. If `<project>/_bmad/_config/manifest.yaml` is
absent, `_bmad` and 49 skills are copied from the downloaded package with no clone
or network call. Use `--project-root`, `--language pt|en|es`, or `--skip-bmad`.

## Entry points

| Client | Planner | Developer | Quick change |
| --- | --- | --- | --- |
| Codex | `codex --profile neres-planner` | `codex --profile neres-developer` | `codex --profile neres-quick-dev` |
| OpenCode | `opencode --agent neres-planner` | `opencode --agent neres-developer` | minimal BMAD through planner |
| Devin | `/neres-planner` | `/neres-developer` | `/neres-quick-dev` |
| Claude Code | `claude --agent neres-planner` | `claude --agent neres-developer` | `claude --agent neres-quick-dev` |

Planner creates proportional BMAD artifacts and TaskPackets. Developer implements
only approved TaskPackets and returns test, QA, security and audit evidence. Quick
dev stops after a QuickPlan until explicit implementation approval.

All clients build a CapabilityMap and prefer healthy relevant MCPs and skills.
Only Devin is provider/model/skill neutral. Base configuration, credentials and
MCP configuration are not modified.

Use `--force` only after a dry run. It backs up and replaces managed Neres names;
it never overwrites an existing BMAD installation.
