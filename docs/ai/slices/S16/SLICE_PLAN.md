# S16 — Plano do slice

## Objetivo

Disponibilizar a arquitetura Neres Agentic BMAD por um único comando `npx`, sem
exigir clone do NeresArmy, preservando os contratos existentes de Codex,
OpenCode e Devin.

## Entrega única

- pacote público `@mneresc/neres-agentic-bmad`;
- binário `neres-agentic` com dispatcher multiplataforma;
- instalações `codex`, `opencode` e `devin`;
- documentação npx no README e nos guias da skill;
- inspeção determinística do conteúdo do tarball;
- smoke test do `.tgz` real antes da publicação.

## Dependências e riscos

- Node.js 22.12 ou superior;
- autenticação npm válida para o escopo `@mneresc`;
- publicação é externa e irreversível para a combinação nome/versão;
- nenhum merge automático faz parte deste slice.
