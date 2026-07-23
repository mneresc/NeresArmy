# S02 — Inventário, evidência e composição textual

## Objetivo

Transformar Markdown autorizado em V2 rastreável, sem modelo externo, cobrindo a Fase
2 da especificação: inventário, estado da fonte, perfil didático, evidência e
composição law-afo, mathematics, technical-it e hybrid.

## Comportamento esperado

- inventariar Markdown e imagens com hash, tamanho, status e estrutura;
- registrar headings, tabelas, código, fórmulas, callouts, links e embeds;
- classificar nota como `raw` ou `structured`;
- aceitar perfil manual ou inferir `law-afo`, `mathematics`, `technical-it`,
  `hybrid` ou `generic` somente do texto autorizado;
- criar claims `supported` com origem e trecho literal;
- nunca promover `ambiguous`, `conflicting`, `missing` ou `illegible` a fato certo;
- preservar nota estruturada, tabelas, callouts, código, fórmulas e edge cases;
- compor nota bruta com o heading principal do perfil sem inventar exemplos;
- escrever apenas no output separado;
- gerar inventário e content model em `_audit`;
- produzir resultado idempotente.

## Fora de escopo

- OCR/multimodal real;
- chamada OpenAI ou outro provedor;
- Archify e artefatos gráficos;
- auditorias finais de números, modalidade, fórmula, código e topologia;
- overview de pasta e relatório final completo.

## Contratos afetados

- `SourceInventory`, `SourceRecord`, `MarkdownAnalysis`;
- `SourceStateResult`, `DomainProfileResult`;
- `EvidenceClaim`, `ContentModel`;
- `CompositionResult`, `BuildResult`;
- CLI `build` passa a executar escrita quando `--dry-run` não estiver presente.

## Segurança

- somente entries aprovadas pelo resolver S01;
- links e wikilinks são registrados, nunca seguidos;
- texto-fonte é dado, não instrução;
- output permanece dentro do vault e não pode conter/sobrescrever a origem;
- nenhuma rede ou processo externo.

## Aprovação

O usuário aprovou a arquitetura agnóstica, execução local pelo agente e criação de V2
por chat. Este slice implementa exatamente a Fase 2 já aprovada no plano.
