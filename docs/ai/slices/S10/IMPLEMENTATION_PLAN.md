# Plano de implementação — S10

## Aprovação

Autorização humana registrada na solicitação: “Execute esse plano”.

## Menor diff

1. Criar `scripts/catalog.mjs` para descobrir somente `skills/<slug>`, validar o
   contrato da skill e renderizar o catálogo Markdown.
2. Criar `scripts/skill-installer.mjs` como núcleo testável que copia uma seleção
   explícita de skills, preservando a filtragem de arquivos de desenvolvimento.
3. Converter `scripts/install-skill.mjs` em CLI fina com `--skill` e `--all`.
4. Adicionar os metadados e o cookbook canônico à primeira skill.
5. Substituir o README raiz por uma página de catálogo, geração e instalação.
6. Adicionar scripts npm para validar, gerar catálogo e executar testes de catálogo.
7. Executar testes RED, check do workspace e smoke test do instalador.

## Arquivos previstos

- `scripts/catalog.mjs`
- `scripts/skill-installer.mjs`
- `scripts/install-skill.mjs`
- `scripts/generate-catalog.mjs`
- `scripts/validate-skills.mjs`
- `scripts/tests/catalog.test.mjs`
- `skills/neres-study-refinery/catalog.json`
- `skills/neres-study-refinery/docs/COOKBOOK.md`
- `README.md`, `docs/CATALOG.md`, `package.json`

## Não alterações

- Nenhuma dependência nova.
- Nenhuma publicação npm.
- Nenhum arquivo em `src/` ou contrato do CLI `neres-study-refinery`.

## Validação

- `node --test scripts/tests/catalog.test.mjs`
- `npm run validate:skills`
- `npm run generate:catalog`
- `npm run check --workspace @mneresc/neres-study-refinery`
- Smoke test local de `--skill` e `--all` em diretórios temporários.
