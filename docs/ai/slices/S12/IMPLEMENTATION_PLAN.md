# Plano de implementação — S12

## Gate humano

Plano aprovado pelo pedido explícito de criar e publicar a skill
`ob-study-visual-mapper`. Não há mudança de schema existente, dependência nova,
publicação npm ou autorização de merge.

## Menor diff correto

1. Inicializar a pasta pelo `init_skill.py` oficial, preservando o teste RED.
2. Implementar `visual_map.py` para IDs, paths, routing, render, recall e update.
3. Implementar `validate_canvas.py` e `validate_manifest.py` com CLIs portáveis.
4. Adicionar schemas/templates estritamente necessários.
5. Escrever `SKILL.md` conciso e referências por progressive disclosure.
6. Adicionar README/cookbook/catalog/openai.yaml conforme NeresArmy.
7. Registrar a skill em README, catálogo e compatibilidade.
8. Rodar testes focados, quick validation e todos os checks do monorepo.
9. Auditar diff e segurança; commitar por fases; publicar branch e abrir PR.

## Arquivos previstos

- `skills/ob-study-visual-mapper/**`
- `README.md`
- `docs/CATALOG.md` gerado
- `docs/COMPATIBILITY.md`
- `docs/ai/slices/S12/**`

## Contratos

- JSON Canvas 1.0 sem propriedades top-level extras.
- Manifest `visual-map-manifest/v1` em arquivo separado.
- CLI: `validate_canvas.py <file> [--manifest ...] [--json] [--strict]`.
- CLI: `validate_manifest.py <file> [--json]`.

## Riscos e mitigação

- Evitar falsos positivos de overlap: ignorar containers group na comparação
  normal e validar filhos geometricamente.
- Evitar path traversal: rejeitar absolutos, `..` e backslashes em referências.
- Evitar atualização destrutiva: o helper retorna merge e conflitos; nunca apaga
  manual sem proveniência.
- Evitar integração obrigatória: detectar disponibilidade por parâmetro explícito.

## Validações

- RED original torna-se GREEN sem relaxar asserções.
- `quick_validate.py` da skill-creator.
- Scripts npm documentados pelo repositório.
- `git diff --check`, diff completo e staged diff antes de cada commit.

