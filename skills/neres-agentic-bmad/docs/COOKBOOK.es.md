# Cookbook — Neres Agentic BMAD

[Português](COOKBOOK.md) · [English](COOKBOOK.en.md) · [Español](COOKBOOK.es.md)

- Instalación interactiva: `npx -y @mneresc/neres-agentic-bmad`.
- Preview: añada `--dry-run` al comando explícito del cliente.
- Actualización gestionada: revise el preview y use `--force`; conserve el backup.
- Claude Code: `install claude-code --scope project` y después `claude --agent neres-planner`.
- Diagnóstico de bug: ejecute `neres-bug-doctor` en modo read-only; genera un
  `BugReport` y puede pasar un fix pequeño confirmado a `neres-quick-dev`, cuyo
  QuickPlan todavía exige autorización.
- BMAD existente: se conserva cuando existe `_bmad/_config/manifest.yaml`.
- BMAD parcial: restaure o elimine `_bmad` y skills `bmad-*` parciales; force no
  mezcla instalaciones.
- Error de modelo: consulte el inventario real del cliente; no invente IDs.
- Agente ausente: compruebe directorios nativos y reinicie clientes que cargan
  agentes al iniciar la sesión.
- Después de dos intentos fallidos, deténgase y entregue la evidencia decisiva.

El instalador nunca modifica configuración base, credenciales ni MCPs.
