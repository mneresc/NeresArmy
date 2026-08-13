# Neres Agentic BMAD

[Português](README.md) · [English](README.en.md) · [Español](README.es.md)

Instalador multiagente autocontenido para Codex, OpenCode, Devin CLI/Desktop y
Claude Code. El paquete npm incluye todos los agentes, skills, scripts y BMAD
Method `6.11.0` ya construido y fijado. Durante la instalación no clona
repositorios ni descarga BMAD.

## Instalación

```powershell
npx -y @mneresc/neres-agentic-bmad
```

El selector interactivo permite uno o varios clientes, alcance proyecto/usuario e
idioma portugués, inglés o español. Comandos no interactivos:

```powershell
npx -y @mneresc/neres-agentic-bmad install codex
npx -y @mneresc/neres-agentic-bmad install opencode
npx -y @mneresc/neres-agentic-bmad install devin --scope project
npx -y @mneresc/neres-agentic-bmad install claude-code --scope project
```

Use `--dry-run`, `--project-root <repo>`, `--language pt|en|es`, `--force` o
`--skip-bmad`. Force reemplaza solamente nombres Neres gestionados y crea una
copia de seguridad. Una instalación BMAD válida existente siempre se conserva.

## Contenido y seguridad

Cada cliente recibe entry points Neres nativos, once especialistas y el protocolo
compartido. Si BMAD no existe, el instalador copia `_bmad` y 49 skills desde el
propio paquete. La fuente vendorizada es `bmad-method@6.11.0` bajo MIT, con
integridad npm y checksums SHA-256 por archivo.

Los cuatro entry points son `neres-planner`, `neres-developer`,
`neres-quick-dev` y `neres-bug-doctor`. Bug Doctor diagnostica en modo read-only,
contrasta la causa raíz con la lente BMAD de edge cases y genera un `BugReport`.
Un fix local confirmado pasa al quick-dev Neres, que todavía se detiene después
del QuickPlan para obtener autorización explícita.

El paquete no tiene dependencias runtime ni scripts npm de instalación. CI ejecuta
`npm audit`, SBOM CycloneDX, GitHub Dependency Review cuando Dependency Graph
está habilitado y validación integral del
vendor. Consulte [Seguridad](docs/SECURITY.es.md), [Uso](docs/USAGE.es.md),
[Cookbook](docs/COOKBOOK.es.md) y el informe público de
[Socket](https://socket.dev/npm/package/%40mneresc%2Fneres-agentic-bmad).

Requiere Node.js 22.12+. Nunca modifica credenciales, MCPs ni configuraciones base.
Algunas skills Python de BMAD requieren el runtime externo `uv`.
