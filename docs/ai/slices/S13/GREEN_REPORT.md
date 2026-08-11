# S13 Green Report

## Resultado

GREEN. O bundle instala 2 agentes primários, 11 subagentes ocultos e a skill
compartilhada `agentic-bmad`, preservando o BMAD e `opencode.jsonc` existentes.

## Evidência automatizada

- `node skills/neres-agentic-bmad/tests/opencode-bundle.test.mjs`: 5/5.
- `python .../skill-creator/scripts/quick_validate.py skills/neres-agentic-bmad`: PASS.
- `npm run validate:skills`: 4 skills válidas.
- `npm test`: suites Node, Vitest e Python verdes.
- `npm run typecheck`: PASS.
- `npm run build`: PASS.
- `npm run check`: PASS.

## Smoke real do OpenCode

Versões: OpenCode 1.18.15 e BMAD 6.10.0.

### Planner

- carregou `agentic-bmad`;
- chamou `plan-nerinhos-subagent-reader` em `deepseek-v4-flash`;
- produziu TaskPacket e escreveu somente em `_bmad-output/**`;
- não alterou `src`, testes ou `package.json`.

### Developer

- primário executado em `deepseek-v4-pro`;
- reader executado antes da mudança;
- coder executado em `kimi-k2.7-code` e alterou somente `src/increment.mjs`;
- test agent executado em `deepseek-v4-flash`: 1 teste passou, 0 falharam;
- QA executado em `deepseek-v4-pro`, sem editar;
- auditor executado em `glm-5.2`: `PASS`;
- contraprova externa: `npm test` passou 1/1.

## Limitação real

O catálogo global desta instalação do OpenCode adicionou aproximadamente 45 mil a
54 mil tokens de contexto nas sessões mínimas. Isso não vem dos handoffs do bundle e
não pode ser removido com segurança pelo instalador sem alterar configuração pessoal.
