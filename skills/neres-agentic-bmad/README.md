# Neres Agentic BMAD

[Português](README.md) · [English](README.en.md) · [Español](README.es.md)

[![Socket](https://socket.dev/api/badge/npm/package/@mneresc/neres-agentic-bmad)](https://socket.dev/npm/package/%40mneresc%2Fneres-agentic-bmad)

Instalador multiagente autocontido para Codex, OpenCode, Devin CLI/Desktop e
Claude Code. O pacote já contém todos os agentes, skills, scripts e uma cópia
construída e fixada do BMAD Method `6.11.0`; depois que o npm baixa este pacote, a
instalação não clona repositórios nem baixa o BMAD.

## Instalação interativa

```powershell
npx -y @mneresc/neres-agentic-bmad
```

Selecione um ou vários destinos, o escopo de Claude/Devin e o idioma do BMAD. Para
automação, use a forma explícita:

```powershell
npx -y @mneresc/neres-agentic-bmad install codex
npx -y @mneresc/neres-agentic-bmad install opencode
npx -y @mneresc/neres-agentic-bmad install devin --scope project
npx -y @mneresc/neres-agentic-bmad install claude-code --scope project
```

Acrescente `--dry-run` para visualizar sem escrever. Use `--project-root <repo>`
para indicar onde `_bmad` será instalado e `--language pt|en|es` para o idioma dos
documentos BMAD. `--force` substitui somente nomes Neres gerenciados e cria backup;
ele não sobrescreve um BMAD existente. `--skip-bmad` é uma opção consciente para
ambientes que já fornecem o workflow por outro mecanismo.

## O que é instalado

| Destino | Entradas | Especialistas | Skills |
| --- | ---: | ---: | --- |
| Codex | 3 profiles | 11 custom agents | Neres + 49 BMAD |
| OpenCode | 2 primary agents | 11 subagents | Neres + 49 BMAD |
| Devin | 3 entry skills | 11 custom subagents | Neres + 49 BMAD |
| Claude Code | 3 entry agents | 11 subagents | Neres + 49 BMAD |

No Claude Code, os arquivos ficam em `.claude/agents` e `.claude/skills` no modo
projeto, ou em `~/.claude` no modo usuário. Inicie com `claude --agent
neres-planner`, `neres-developer` ou `neres-quick-dev`.

## BMAD incluído

O bundle BMAD veio de `bmad-method@6.11.0` (MIT), com URL, integridade npm,
checksums SHA-256 de cada arquivo e licença em `vendor/bmad`. Se o projeto já tem
`_bmad/_config/manifest.yaml`, ele é preservado. Um estado parcial falha antes de
misturar arquivos.

## Segurança da cadeia de suprimentos

- zero dependências runtime e zero scripts de instalação npm;
- `npm audit` de runtime e SBOM CycloneDX em cada PR/push;
- GitHub Dependency Review quando o Dependency Graph estiver habilitado;
- validação integral do BMAD vendorizado e rejeição de `.pyc`/`__pycache__`;
- relatório e SBOM armazenados por 90 dias como artefatos do workflow;
- análise externa pública no [Socket](https://socket.dev/npm/package/%40mneresc%2Fneres-agentic-bmad).

Veja [Segurança](docs/SECURITY.md), [Guia de uso](docs/USAGE.md) e
[Cookbook](docs/COOKBOOK.md).

## Requisitos e limites

- Node.js 22.12 ou superior.
- O cliente escolhido deve estar instalado e autenticado; o pacote não altera
  credenciais, MCPs, `config.toml`, `opencode.jsonc`, `settings.json` ou `.mcp.json`.
- Codex e OpenCode usam os modelos documentados em seus bundles. Devin preserva a
  neutralidade de modelos, MCPs e skills disponíveis. Claude Code usa aliases
  nativos (`inherit`, `opus`, `sonnet`, `haiku`).
- BMAD 6.11.0 usa `uv` em algumas skills Python; o instalador entrega os arquivos,
  mas não instala ferramentas de sistema.
