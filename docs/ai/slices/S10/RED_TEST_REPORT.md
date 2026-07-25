# Relatório RED — S10

## Comando

```text
node --test scripts/tests/catalog.test.mjs
```

## Resultado inicial

Falhou antes da implementação com `ERR_MODULE_NOT_FOUND` para
`scripts/catalog.mjs`, importado pelos testes de contrato do catálogo. A falha
prova que ainda não existiam descoberta, validação nem instalador genérico.

## Garantias dos testes

- Descoberta e geração de uma linha por skill.
- Diagnóstico para cookbook ou metadados ausentes, nome divergente e caminho local.
- Cópia de uma skill selecionada e de todas as skills canônicas em diretório
  temporário.
