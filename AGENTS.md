# NeresArmy — Regras Locais

## Escopo

Monorepo público de skills mantidas por `mneresc`.

## Stack

- Node.js 22.12+
- TypeScript ESM
- npm workspaces
- Vitest

## Comandos

```text
npm install
npm test
npm run typecheck
npm run check --workspace @mneresc/neres-study-refinery
```

## Regras

- Tratar o vault como fonte fechada.
- Nunca adicionar pesquisa externa ao pipeline de transformação.
- Nunca sobrescrever fontes.
- Preservar claims, números, modalidade, fórmulas, código e topologia.
- Não relaxar testes RED.
- Manter compatibilidade Windows.
- Não persistir chaves ou conteúdo de vault em logs.
- Fazer commits separados por fase.
- Não publicar npm sem decisão explícita.
- Não fazer merge automático.
