# S13 — Neres Agentic BMAD para OpenCode

## Objetivo

Publicar e instalar uma arquitetura multiagente OpenCode que preserve o BMAD como
metodologia de planejamento, reduza custo e contexto por delegação, aplique menor
privilégio e valide a configuração contra a instalação real.

## Ambiente descoberto

- OpenCode `1.18.15`.
- BMAD `6.10.0`, instalado globalmente com módulos `core`, `bmm`, `tea`, `bmb`,
  `cis`, `wds` e `bmad-loop`.
- Agentes Markdown globais: `~/.config/opencode/agents/*.md`.
- Skills globais: `~/.config/opencode/skills/<name>/SKILL.md` e
  `~/.agents/skills/<name>/SKILL.md`.
- `permission` é o mecanismo atual; `tools` e `maxSteps` são legados.
- `steps`, `mode`, `hidden`, `model` e `permission.task` são suportados.

## Escopo

- Dois agentes primários: `neres-planner` e `neres-developer`.
- Quatro subagentes de planejamento e sete de desenvolvimento.
- Skill compartilhada `agentic-bmad` com contratos, routing, isolamento de contexto,
  escalation, paralelização e observabilidade.
- Instalador com dry-run, validação de modelos, recusa de overwrite e backup em
  atualização forçada.
- Validador determinístico do bundle e smoke test real com a CLI OpenCode.
- README, cookbook, catálogo, compatibilidade e guia operacional curto.
- Instalação global na máquina atual e publicação por Pull Request.

## Não escopo

- Reinstalar ou atualizar OpenCode/BMAD.
- Alterar `opencode.jsonc` ou customizações BMAD.
- Plugin de routing dinâmico, telemetria financeira ou publicação npm.
- Criar agentes adicionais apenas para utilizar todos os modelos disponíveis.
- Merge automático do Pull Request.

## Contratos observáveis

- Layout instalável da skill NeresArmy.
- Treze arquivos de agente descobertos pela CLI.
- `ContextPack`, `TaskPacket`, `TaskReport`, `TestReport`, `QAReport`,
  `SecurityReport` e `AuditReport`.
- Permissões e allowlists de subagentes verificáveis no resolved config.
- IDs de modelo válidos no inventário retornado por `opencode models`.

## Riscos

- OpenCode não troca automaticamente o modelo estático de um subagente por tentativa;
  escalations T4 devem voltar ao primário GLM-5.2, e Kimi K3 permanece excepcional
  por override explícito de sessão.
- Permissões de arquivo são padrões estáticos; `allowed_files` de cada TaskPacket
  continua sendo também uma obrigação comportamental do worker.
- Smoke tests com LLM têm custo e dependem de autenticação; validações estruturais e
  `opencode debug` devem ser executadas antes deles.

## Aprovação humana

O pedido atual autoriza explicitamente criar no computador e publicar após estável.
Não há autorização para merge automático ou publicação npm.
