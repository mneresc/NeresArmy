# Neres Agentic BMAD

[Português](README.md) · [English](README.en.md) · [Español](README.es.md)

A self-contained multi-agent installer for Codex, OpenCode, Devin CLI/Desktop and
Claude Code. The npm package includes every agent, skill, script and a pinned,
prebuilt BMAD Method `6.11.0` bundle. It does not clone a repository or download
BMAD during installation.

## Install

```powershell
npx -y @mneresc/neres-agentic-bmad
```

The interactive selector supports one or multiple clients, project/user scope and
Portuguese, English or Spanish BMAD output. Non-interactive commands:

```powershell
npx -y @mneresc/neres-agentic-bmad install codex
npx -y @mneresc/neres-agentic-bmad install opencode
npx -y @mneresc/neres-agentic-bmad install devin --scope project
npx -y @mneresc/neres-agentic-bmad install claude-code --scope project
```

Use `--dry-run`, `--project-root <repo>`, `--language pt|en|es`, `--force` or
`--skip-bmad` as needed. Force updates only managed Neres names and creates a
backup. Existing valid BMAD installations are preserved.

## Contents and safety

Each client receives native Neres entry points, eleven specialists and the shared
protocol. When BMAD is absent, the installer copies `_bmad` plus 49 skills from the
package itself. The vendored source is `bmad-method@6.11.0` under MIT, with npm
integrity and per-file SHA-256 checksums.

The package has no runtime dependencies or npm install scripts. CI performs runtime
`npm audit`, CycloneDX SBOM generation, GitHub Dependency Review when the
repository Dependency Graph is enabled, and vendor
integrity validation. See [Security](docs/SECURITY.en.md),
[Usage](docs/USAGE.en.md), [Cookbook](docs/COOKBOOK.en.md) and the public
[Socket report](https://socket.dev/npm/package/%40mneresc%2Fneres-agentic-bmad).

Requires Node.js 22.12+. Client credentials, MCP configuration and base settings
are never modified. Some BMAD Python skills require the external `uv` runtime.
