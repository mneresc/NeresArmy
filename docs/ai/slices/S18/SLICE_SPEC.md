# S18.1 — Especificação

## Comportamento esperado

1. Codex expõe `codex --profile neres-bug-doctor`.
2. OpenCode expõe os agentes primários `neres-quick-dev` e
   `neres-bug-doctor`, corrigindo a ausência do primeiro no bundle atual.
3. Devin expõe a skill de entrada `/neres-bug-doctor`.
4. Claude Code expõe `claude --agent neres-bug-doctor`.
5. O agente constrói o `CapabilityMap` e prefere capacidades saudáveis e
   pertinentes sem assumir, instalar ou autenticar integrações.
6. O agente usa ferramentas determinísticas para tentar reproduzir o bug e
   registrar evidência, mas não edita código, testes ou configuração.
7. A análise BMAD usa `bmad-review` com a lente `edge-case-hunter` como apoio;
   ela não substitui a prova da causa-raiz.
8. O agente produz `BugReport` com sintoma, comportamento esperado/real,
   reprodução, evidências, causa-raiz, confiança, arquivos afetados, casos-limite,
   fix sugerido, regressões e destino.
9. Causa confirmada, risco baixo e mudança local de um a cinco arquivos roteiam
   para o nosso `neres-quick-dev`, que ainda deve parar após o QuickPlan.
10. Risco elevado ou impacto arquitetural roteia para `neres-planner`.
11. Reprodução ausente ou confiança insuficiente termina em
    `needs-more-evidence`, sem inventar causa nem fix.
12. Instaladores preservam configurações-base, MCPs, credenciais e arquivos não
    gerenciados, incluindo os mesmos backups já usados para conflitos.
13. READMEs e guias de uso documentam o quarto ponto de entrada em português,
    inglês e espanhol.

## Fora de escopo

- implementação automática do reparo;
- alteração do limite de concorrência ou dos onze subagentes especializados;
- publicação de nova versão npm neste slice.

## Critérios de aceite

- validadores estáticos reconhecem exatamente quatro entradas em cada cliente;
- instalações dry-run e reais incluem `neres-bug-doctor` sem tocar configurações;
- testes verificam o contrato read-only, o `BugReport` e as três rotas;
- todos os testes preexistentes continuam verdes.
