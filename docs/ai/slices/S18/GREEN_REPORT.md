# S18.1 — Relatório GREEN

## Resultado

Todos os testes RED passaram sem remoção ou relaxamento de asserções.

## Evidência focada

```text
npm run check --workspace @mneresc/neres-agentic-bmad
```

- 34/34 testes Node aprovados;
- OpenCode: 15 agentes, sendo 4 entradas e 11 subagentes;
- Codex: 4 profiles e 11 custom agents;
- Devin: 4 entry skills e 11 subagentes;
- Claude Code: 4 entry agents e 11 subagentes;
- BMAD 6.11.0 com 49 skills validado;
- tarball validado com 394 arquivos e sem artefatos proibidos;
- `git diff --check` aprovado.

## Regressão do monorepo

```text
npm run check
```

- validação das 4 skills aprovada;
- 3/3 testes dos scripts do repositório aprovados;
- 18 testes Python do learner profile aprovados;
- 20 testes Python do visual mapper aprovados;
- 69/69 testes do study refinery aprovados;
- typecheck e build do study refinery aprovados;
- check completo do `neres-agentic-bmad` aprovado.

A primeira execução no sandbox foi bloqueada pelo esbuild ao resolver um caminho
local do `neres-study-refinery`; a repetição autorizada fora do sandbox passou
integralmente, confirmando que não era regressão do código.

## Limitações

Não houve smoke em clientes autenticados nem publicação npm. Essas ações externas
não são necessárias para provar o contrato estático e permanecem fora do slice.
