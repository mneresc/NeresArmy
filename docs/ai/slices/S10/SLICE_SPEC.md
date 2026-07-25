# S10 — Catálogo de skills e instalação individual

## Objetivo

Transformar o NeresArmy de repositório centrado em uma única skill em um catálogo
extensível. Cada diretório em `skills/<nome>` deve ser uma unidade documentada,
validável e instalável isoladamente, sem tornar `neres-study-refinery` um caso
especial na raiz.

## Inclui

- Contrato mínimo por skill: `SKILL.md`, `README.md`, `docs/COOKBOOK.md`,
  `catalog.json` e metadados de interface quando aplicáveis.
- Catálogo gerado a partir das skills, com categoria, estado, instalação e links.
- Validador de contrato e portabilidade da documentação.
- Instalador local com seleção por `--skill` ou `--all`.
- Documentação raiz para instalação do catálogo e de uma skill isolada via `npx
  skills`.
- Migração da documentação existente de `neres-study-refinery` para sua pasta.

## Não inclui

- Publicar uma nova versão npm.
- Criar ou distribuir uma nova skill além da já existente.
- Alterar o comportamento do compilador `neres-study-refinery`.
- Tornar um plugin Claude uma dependência obrigatória.

## Critérios de aceite

1. O repositório não contém scripts raiz que fixem `neres-study-refinery` como a
   única skill.
2. Cada skill canônica possui documentação própria e metadados de catálogo.
3. O catálogo raiz é gerado a partir dos metadados e lista a skill uma vez.
4. O validador falha para uma skill sem os arquivos obrigatórios, com nome
   divergente ou com caminho local real na documentação.
5. `scripts/install-skill.mjs --skill <nome>` instala somente a skill solicitada;
   `--all` instala todas as skills encontradas.
6. O README raiz documenta `npx skills@latest add mneresc/NeresArmy` e instalação
   por skill, sem prometer publicação npm adicional.
7. Testes, typecheck e build existentes continuam verdes.

## Contratos afetados

- CLI local de instalação: novo argumento público `--skill` e `--all`.
- Convenção pública do repositório: uma skill é descoberta em `skills/<slug>`.
- Nenhum contrato do pacote npm existente é alterado.

## Riscos

- O instalador externo `skills` pode evoluir; o repositório documentará o fluxo
  oficial e o smoke test verificará o nosso instalador determinístico.
- Duplicar documentação pode causar deriva; o cookbook canônico ficará co-localizado
  com a skill e a raiz somente apontará para ele.
