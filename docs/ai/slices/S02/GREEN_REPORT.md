# S02 — GREEN report

## Status

**GREEN verificado** em 2026-07-23.

## Prova RED

As suítes de módulo falharam por módulos ausentes e a CLI real retornou código `2`
para build não-dry-run. Nenhuma falha era de fixture ou ambiente.

## Gate final

```text
npm run check --workspace @neresarmy/neres-study-refinery
```

Resultado:

```text
tsc --noEmit
Test Files  10 passed (10)
Tests       43 passed (43)
tsc -p tsconfig.build.json
exit code   0
```

## Comportamentos comprovados

- inventário com SHA-256, tamanho, status e estruturas Markdown;
- embeds ligados a `referencedBy`, sem seguir links;
- classificação explicável raw/structured;
- classificação automática dos cinco perfis e override manual;
- claims supported com excerpt literal e proveniência;
- preservação de tabela, callout e Edge cases estruturados;
- composição bruta por seções didáticas sustentadas;
- build separado de nota e pasta;
- artifacts `_audit`;
- original byte a byte intacto;
- idempotência de saída;
- nenhuma leitura de link web ou wikilink externo.

## Dependências

Nenhuma dependência nova foi adicionada na Fase 2.
