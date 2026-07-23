# S03 — Review log

## Veredito

**READY para commit da Fase 3**, sem P0/P1 aberto.

## Achado corrigido

A primeira revisão encontrou que nota estruturada preservava o embed, mas não
incorporava a transcrição visual supported. Um teste RED reproduziu a lacuna; a
correção acrescenta `Evidências visuais` sem alterar tabela, callout ou Edge cases.

## Segurança

- manifest precisa estar dentro do vault e corresponder ao hash;
- adapter OpenAI verifica autorização, key e model antes de ler/enviar bytes;
- uma chamada contém somente a imagem corrente e prompt de fonte fechada;
- request não habilita ferramentas nem web e não registra conteúdo em logs;
- erros HTTP não incluem corpo de resposta ou segredo.

## Riscos residuais

- análise visual do agente/provedor ainda precisa de revisão humana quando a confiança
  for limítrofe;
- `store: false` não elimina políticas de retenção/abuso do provedor;
- diagrama visual é apenas evidência intermediária até Fase 4;
- nenhum teste fez chamada remota real por design.
