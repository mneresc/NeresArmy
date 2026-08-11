# Neres Agentic BMAD no Codex

## Entry points

| Profile | Use quando | Comando |
| --- | --- | --- |
| `neres-planner` | Feature, ambiguidade ou planejamento BMAD proporcional | `codex --profile neres-planner` |
| `neres-developer` | Story/spec e TaskPackets estão prontos | `codex --profile neres-developer` |
| `neres-quick-dev` | Mudança pequena, local e de baixo risco | `codex --profile neres-quick-dev` |

Quick-dev sempre para após QuickPlan. Implemente apenas em uma rodada posterior com
autorização explícita.

## Nerinhos e routing

| Subagent | Model | Reasoning | Sandbox | Purpose |
| --- | --- | --- | --- | --- |
| plan reader | `gpt-5.6-luna` | low | read-only | ContextPack de planejamento |
| plan writer | `gpt-5.6-terra` | low | workspace-write | Artefatos aprovados |
| plan architect | `gpt-5.6-sol` | high | read-only | Decisão cross-cutting |
| plan critic | `gpt-5.6-terra` | medium | read-only | Lacunas e executabilidade |
| dev reader | `gpt-5.6-luna` | low | read-only | ContextPack local |
| dev mechanical | `gpt-5.6-luna` | low | workspace-write | Alteração prescrita |
| dev coder | `gpt-5.6-terra` | medium | workspace-write | Implementação normal |
| dev test | `gpt-5.6-luna` | low | workspace-write | Gates T0 e TestReport |
| dev QA | `gpt-5.6-terra` | medium | read-only | Review independente |
| dev security | `gpt-5.6-terra` | high | read-only | Review por gatilho |
| dev auditor | `gpt-5.6-terra` | medium | read-only | Matriz final |

Escalone para Sol high/xhigh somente após risco material ou falha demonstrada.

## BMAD e contexto

BMAD instalado continua sendo source of truth. A skill apenas escolhe o workflow
proporcional e transporta ContextPack, QuickPlan, TaskPacket e relatórios compactos.
Readers não devolvem arquivos ou logs completos.

Antes de delegar, os profiles inventariam MCPs e skills disponíveis. Eles preferem
capacidades saudáveis úteis para filesystem, testes, E2E e revisão, mas essas
capacidades apoiam o workflow BMAD: não o substituem nem mudam o routing de modelos
definido para Codex.

## Permissões

Planner usa sandbox read-only. Developer e quick-dev usam workspace-write com
approvals on-request. Reviewers são read-only. TaskPacket limita escopo por contrato e
o diff confirma aderência; o Codex não converte allowed_files dinamicamente em regra
de filesystem.

## Exemplos

- `Planeje esta feature com BMAD proporcional e gere TaskPackets.`
- `Implemente os TaskPackets prontos, teste e entregue AuditReport.`
- `Diagnostique este bug pequeno e pare após o QuickPlan.`
