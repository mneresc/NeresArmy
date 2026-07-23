# S03 — Evidência visual multimodal

## Objetivo

Implementar a Fase 3 com interface agnóstica `VisualContentExtractor`, manifest
produzido pelo próprio agente e adaptador OpenAI opt-in.

## Critérios

- suportar PNG/JPG/JPEG/WEBP já autorizados pelo scope;
- vincular análise ao SHA-256 da imagem;
- classificar nos 11 tipos da especificação;
- representar texto, tabela, fórmula, nós, arestas, regiões e incertezas;
- incorporar somente evidência supported com confiança mínima;
- material ilegível gera warning, não fato;
- manifest deve estar dentro do vault;
- OpenAI exige simultaneamente flag explícita, API key e model;
- request OpenAI usa imagem autorizada, Structured Outputs, `store: false` e nenhuma
  ferramenta;
- nenhum teste realiza rede.

## Fora de escopo

Renderização Archify, validação topológica pós-render e SVG/HTML.
