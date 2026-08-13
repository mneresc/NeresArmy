# Guía de uso — Neres Agentic BMAD

[Português](USAGE.md) · [English](USAGE.en.md) · [Español](USAGE.es.md)

## Instalación

Ejecute `npx -y @mneresc/neres-agentic-bmad` para seleccionar uno o varios
clientes. Para automatización use `install codex`, `install opencode`, `install
devin --scope project` o `install claude-code --scope project`. Primero añada
`--dry-run`.

El paquete contiene BMAD 6.11.0. Si no existe
`<proyecto>/_bmad/_config/manifest.yaml`, copia `_bmad` y 49 skills desde el
paquete descargado, sin clone ni red. Use `--project-root`, `--language pt|en|es`
o `--skip-bmad`.

## Entry points

| Cliente | Planner | Developer | Cambio pequeño | Diagnóstico de bug |
| --- | --- | --- | --- | --- |
| Codex | `codex --profile neres-planner` | `codex --profile neres-developer` | `codex --profile neres-quick-dev` | `codex --profile neres-bug-doctor` |
| OpenCode | `opencode --agent neres-planner` | `opencode --agent neres-developer` | `opencode --agent neres-quick-dev` | `opencode --agent neres-bug-doctor` |
| Devin | `/neres-planner` | `/neres-developer` | `/neres-quick-dev` | `/neres-bug-doctor` |
| Claude Code | `claude --agent neres-planner` | `claude --agent neres-developer` | `claude --agent neres-quick-dev` | `claude --agent neres-bug-doctor` |

Planner crea artefactos BMAD proporcionales y TaskPackets. Developer implementa
solamente TaskPackets aprobados y entrega evidencia de tests, QA, seguridad y
auditoría. Quick dev termina con QuickPlan hasta una autorización explícita.
Bug Doctor reproduce y diagnostica en modo read-only, genera un `BugReport` y
envía un fix pequeño confirmado al quick-dev Neres sin omitir su autorización.

Todos los clientes construyen un CapabilityMap y prefieren MCPs y skills
disponibles. Solo Devin mantiene neutralidad de provider/modelo/skill. El
instalador no cambia credenciales, MCPs ni configuración base.
