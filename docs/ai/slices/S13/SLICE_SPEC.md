# Especificação — S13

## Objetivo

Entregar `neres-agentic-bmad`, um pacote OpenCode instalável que orquestre BMAD com
dois agentes primários, onze subagentes especializados, modelos em tiers, ferramentas
determinísticas e artefatos compactos de handoff.

## Inclui

- Estrutura exata de 13 agentes solicitada, usando os nomes canônicos sem a repetição
  acidental `subagent-nerinhos-subagent`.
- IDs reais `opencode-go/*` e limites `steps` compatíveis com OpenCode `1.18.15`.
- Controle `permission.task`, menor privilégio, proteção de `.env`, bloqueio de
  commit/push e reviewers read-only.
- Progressive disclosure em `agentic-bmad`.
- Instalação sem editar a configuração JSON existente.
- Backup antes de overwrite consciente e dry-run sem escrita.
- Observabilidade opcional em JSONL sem prompts, logs brutos, custo inventado ou
  conteúdo sensível.

## Não inclui

- Runtime de roteamento próprio, dependência JavaScript externa, atualização do BMAD,
  alteração de source code de projetos consumidores, merge ou npm publish.

## Critérios de aceite

1. O bundle contém dois primários e onze subagentes ocultos, todos com description,
   mode, model, steps e permissions válidos.
2. Planner só pode delegar aos quatro subagentes `plan-*`; developer só aos sete
   `dev-*`; workers não podem delegar.
3. Readers e reviewers não editam; planner só edita artefatos BMAD; developer e
   workers de escrita bloqueiam commit, push, comandos destrutivos e leitura de env.
4. Todos os modelos configurados existem no inventário real do OpenCode.
5. A skill compartilhada define contratos compactos, tiers, escalation após duas
   falhas, paralelização segura e isolamento de contexto.
6. O instalador oferece `--dry-run`, destino configurável, recusa overwrite e backup
   com `--force`, sem modificar `opencode.jsonc`.
7. `opencode agent list`, `opencode debug agent` e `opencode debug skill` descobrem a
   instalação global.
8. Um smoke test seguro prova planner, developer, reader, coder, teste real, QA e
   auditor, ou registra honestamente qualquer bloqueio externo.
9. README, cookbook, guia operacional, compatibilidade e catálogo documentam uso,
   modelos, escalation e instalação.
10. Todos os gates do NeresArmy passam em Windows; a branch é publicada em draft PR,
    sem merge automático.
