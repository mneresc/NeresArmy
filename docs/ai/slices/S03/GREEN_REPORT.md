# S03 — GREEN report

## Status

**GREEN verificado** em 2026-07-23.

```text
npm run check --workspace @neresarmy/neres-study-refinery

Test Files  13 passed (13)
Tests       50 passed (50)
typecheck   passed
build       passed
```

## Comportamentos comprovados

- interface `VisualContentExtractor` agnóstica;
- manifest do agente vinculado ao path e SHA-256;
- texto, tabela, fórmula, regiões e topologia visual intermediária;
- imagem como único conteúdo didático;
- evidência visual em nota bruta e estruturada;
- imagem ilegível vira warning e não fato;
- OpenAI não chama transporte sem autorização;
- request OpenAI usa Responses, `input_image`, Structured Outputs e `store: false`;
- testes OpenAI usam transporte injetado e não realizam rede.

Nenhuma dependência nova foi adicionada.
