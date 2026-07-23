# S04 — GREEN report

## Status

**GREEN verificado** em 2026-07-23.

```text
npm run check --workspace @neresarmy/neres-study-refinery

Test Files  17 passed (17)
Tests       59 passed (59)
typecheck   passed
build       passed
```

## Archify real

Instalação detectada:

```text
C:\Users\marce\.agents\skills\archify\bin\archify.mjs
```

Provas:

- `doctor`: Node, templates, runtime, validators e cinco renderers OK;
- workflow mínimo: validação com 9/9 checks, 0 erros e 0 warnings;
- `deliver`: artifact HTML de 543486 bytes, SHA-256
  `143a3f97e5a38570816c910c69b11624179c678c315c11e57e0df9030b3a7613`;
- validador próprio aceitou a topologia real;
- adapter completo gerou `.archify.json`, `.html` e `.svg`;
- smoke de architecture com boundary confirmou membership do grupo.

## Comportamentos comprovados

- scorer da rubrica;
- IR e mapping tipado;
- rejeição de nó, aresta, label, direção e grupo divergentes;
- doctor/deliver/check;
- extração do SVG canônico;
- embed SVG e link HTML na V2;
- diagnóstico de instalação ausente.

Nenhuma dependência foi adicionada e nenhum código Archify foi copiado.
