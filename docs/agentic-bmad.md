# Agentic BMAD no OpenCode

Para exemplos completos de TUI e execução não interativa, consulte o
[guia de uso por cliente](../skills/neres-agentic-bmad/docs/USAGE.md).

## Como planejar

Selecione `neres-planner`. Ele classifica tamanho/risco, usa as skills BMAD instaladas
na proporção necessária e entrega artefato BMAD mais TaskPackets.

Antes disso, inventaria skills e MCPs saudáveis que possam apoiar o fluxo. BMAD
permanece obrigatório no bundle OpenCode; capacidades adicionais não o substituem.

## Como desenvolver

Selecione `neres-developer` somente com story/spec e TaskPackets prontos. Ele delega
leitura, implementação, testes, QA, security condicional e auditoria.

Para um bug ainda sem causa comprovada, use `neres-bug-doctor`. Ele reproduz em
modo read-only, aplica a lente BMAD de edge cases, gera `BugReport` e encaminha um
fix pequeno confirmado ao nosso `neres-quick-dev` sem pular o QuickPlan.

## Fluxo

```text
neres-planner -> reader -> BMAD -> writer/critic -> architect se necessário
neres-developer -> reader -> mechanical|coder -> testes -> QA|security -> auditor
```

## Modelos

| Trabalho | Model |
| --- | --- |
| Busca, resumo, mecânico, test orchestration | `opencode-go/deepseek-v4-flash` |
| Orquestração e review normal | `opencode-go/deepseek-v4-pro` |
| Coding | `opencode-go/kimi-k2.7-code` |
| Escrita, arquitetura, diagnóstico forte e auditoria | `opencode-go/glm-5.2` |
| Escalation excepcional manual | `opencode-go/kimi-k3` |

## Escalation

O worker devolve `NEEDS_ESCALATION` após duas falhas, teste persistente sem causa,
TaskPacket insuficiente, arquivo proibido necessário ou risco crítico recém-descoberto.
O orquestrador reespecifica somente o gap; architect/auditor GLM-5.2 ou override
explícito entra apenas quando o risco justificar. Não reinicie todo o planejamento.

## Exemplo

```text
Planeje a correção do bug X com o BMAD proporcional e gere um TaskPacket.
```

```text
Implemente BUG-001, rode gates determinísticos e entregue AuditReport.
```

## Troca de modelo

Altere `assets/opencode/agents/<agente>.md`, valide contra `opencode models`, atualize
a fixture/tabela e reinstale com backup. O OpenCode mantém model estático por agente;
Kimi K3 deve ser override explícito de sessão, não worker adicional.

## Limitação observada

O OpenCode também descobre skills globais fora deste bundle. Em uma instalação com
catálogo global grande, o contexto inicial observado ficou entre 45 mil e 54 mil
tokens até para um smoke pequeno. O bundle reduz os handoffs entre seus agentes, mas
não desativa nem apaga skills globais do usuário. Revise esse catálogo separadamente
se latência e custo continuarem altos.
