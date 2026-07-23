# S04 — Review log

## Veredito

**READY para commit da Fase 4**, sem P0/P1 aberto.

## Achados corrigidos

1. O layout real rejeitou nós consecutivos com largura default. A correção distribui
   até três nós por lane nas colunas 0/2/4 e calcula largura apenas como geometria.
2. O HTML real contém templates JavaScript com `data-node-*`. A validação inicialmente
   lia o documento inteiro. Um teste RED passou a exigir leitura exclusiva do único
   SVG canônico.
3. Agrupamentos passaram a ser preservados como boundaries e auditados pelo
   `data-node-context` de cada membro.

## Segurança

- somente `process.execPath` executa o arquivo Archify configurado, sem shell;
- path explícito inexistente falha com diagnóstico;
- IDs e labels entram por JSON, não por argumentos de shell;
- o renderer não recebe texto externo, apenas IR autorizado;
- HTML passa por `check` e por comparação topológica antes do SVG;
- path Archify é código local confiável e isso está documentado.

## Riscos residuais

- layouts maiores podem ser recusados pelo validator, o que é falha fechada;
- PNG não é gerado por padrão;
- ausência do renderer produz warning e mantém a V2 textual;
- artifacts finais ainda serão consolidados no relatório da Fase 5.
