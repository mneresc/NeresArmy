# S13 Review Log

## Matriz de aceitação

| Critério | Resultado | Evidência |
| --- | --- | --- |
| Dois agentes primários descobertos | PASS | `neres-planner` e `neres-developer` em `opencode agent list` |
| Onze subagentes ocultos descobertos | PASS | quatro de planning e sete de development |
| Planner chama reader e gera TaskPacket | PASS | smoke real com Task tool e artefato em `_bmad-output/**` |
| Developer chama reader e coder | PASS | smoke real; coder em `kimi-k2.7-code` |
| Test runner executa comando real | PASS | `npm test`, 1 passou e 0 falharam |
| QA revisa sem editar | PASS | permissão de edit/bash/task negada e QAReport produzido |
| Auditor roda por último | PASS | AuditReport `PASS` após Task/Test/QA reports |
| Planner não edita código-fonte | PASS | allowlist de edit limitada a `_bmad-output/**` |
| Developer edita somente TaskPacket | PASS | smoke alterou somente `src/increment.mjs` |
| Model IDs existem | PASS | todos encontrados em `opencode models` |
| Configuração pessoal preservada | PASS | instalador não escreve `opencode.jsonc`; teste automatizado |
| Atualização tem backup | PASS | backups reais criados antes de `--force` |

## Revisão de contrato

- Sintaxe alvo: OpenCode v1 em Markdown; `mode`, `model`, `steps`, `hidden` e
  `permission.task` validados pelo runtime.
- Contratos públicos: ContextPack, TaskPacket, TaskReport, TestReport, QAReport,
  SecurityReport e AuditReport.
- BMAD continua fonte de verdade; o bundle não duplica workflows Analyst/PM/
  Architect/QA/Dev.

## Riscos residuais

- Catálogo global grande aumenta contexto, latência e custo fora do controle do
  bundle.
- Kimi K3 permanece override manual excepcional porque o Task tool não troca modelo
  dinamicamente por chamada.
- Dependências de desenvolvimento já existentes via Vitest/Vite apresentam
  `GHSA-2v37-7h3g-55p8` (`nanoid`, high) e `GHSA-fxqj-rqcc-2cmp` (`postcss`,
  moderate). Este pacote não adiciona dependências externas; atualização do stack de
  testes deve ser tratada separadamente, sem `npm audit fix` automático.

## Decisão

READY FOR DRAFT PR. Não fazer merge automático nem publicar pacote npm.
