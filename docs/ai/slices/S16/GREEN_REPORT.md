# S16 — Relatório GREEN

Data: 2026-08-12

## Resultado

O CLI `neres-agentic` e o pacote npm chegaram a GREEN sem alterar os bundles ou
os limites de escrita dos instaladores existentes.

| Evidência | Resultado |
| --- | --- |
| `node --test skills/neres-agentic-bmad/tests/npx-cli.test.mjs` | 6/6 testes passaram |
| gate do workspace `@mneresc/neres-agentic-bmad` | 21/21 testes e três validadores de bundle passaram |
| inspeção de `npm pack` | 79 arquivos, 41.454 bytes; sem testes, fixtures ou artefatos internos |
| smoke do `.tgz` via `npx --package` | ajuda e dry-run Codex/OpenCode/Devin passaram |
| `npm run check` | 4 skills, 3 testes de catálogo, 21 testes do agente, 69 Vitest, 38 Python, typecheck e build passaram |
| `npm publish --dry-run --access public` | aprovou `@mneresc/neres-agentic-bmad@0.1.0` |

## Contratos preservados

- Codex: 3 profiles, 11 agentes e 1 skill; não altera `config.toml`.
- OpenCode: 13 agentes e 1 skill; não altera `opencode.jsonc`.
- Devin: 4 skills e 11 agentes; neutralidade de modelos, MCPs e skills mantida.
- `--force` continua criando backup e `--dry-run` continua sem escrita.

O diretório temporário e o tarball usados no smoke test foram removidos depois
da validação.
