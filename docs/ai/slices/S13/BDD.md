# BDD — S13

## Cenário 1 — Bundle completo e econômico

- **Given** o pacote `neres-agentic-bmad`
- **When** o bundle é validado contra o inventário real de modelos
- **Then** há exatamente dois primários, onze subagentes ocultos, tiers coerentes e
  nenhum ID de modelo inventado.

## Cenário 2 — Delegação isolada

- **Given** os dois orquestradores
- **When** suas permissões de task são resolvidas
- **Then** o planner enxerga somente workers `plan-*`, o developer somente workers
  `dev-*`, e nenhum worker pode iniciar subagentes.

## Cenário 3 — Menor privilégio

- **Given** um planner, worker ou reviewer
- **When** suas permissões são inspecionadas
- **Then** reviewers são read-only, planner não edita source code, developer não faz
  commit/push, `.env` permanece protegido e comandos destrutivos não são permitidos.

## Cenário 4 — Instalação segura

- **Given** um diretório de configuração OpenCode
- **When** o instalador roda em dry-run ou encontra destinos existentes
- **Then** dry-run não escreve, overwrite sem `--force` falha e atualização forçada
  cria backup antes de substituir, sem tocar no arquivo JSON de configuração.

## Cenário 5 — Progressive disclosure e handoff compacto

- **Given** uma tarefa BMAD
- **When** planner e developer delegam trabalho
- **Then** o protocolo usa ContextPack, TaskPacket e relatórios compactos, carrega
  referências apenas quando necessárias e não propaga arquivos/logs/histórico inteiro.

## Cenário 6 — Descoberta real no OpenCode

- **Given** a instalação global concluída
- **When** os comandos de debug/listagem do OpenCode são executados
- **Then** os agentes, a skill, os modelos, os limites e as permissions são resolvidos
  sem erro de sintaxe.

## Cenário 7 — Fluxo seguro ponta a ponta

- **Given** uma alteração temporária e pequena
- **When** planner gera TaskPacket e developer coordena reader, coder, teste, QA e
  auditor
- **Then** uma ferramenta real valida a alteração, reviewers não editam e o auditor
  recebe somente artefatos finais compactos.

## Rastreabilidade

- Critérios 1–5: cenários 1–3 e 5.
- Critério 6: cenário 4.
- Critérios 7–8: cenários 6–7.
- Critérios 9–10: documentação, gates e fluxo de publicação.
