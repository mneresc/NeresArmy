# Plano de testes RED — S13

## Estratégia

Usar `node:test` e apenas a standard library. Validar os arquivos públicos do bundle,
o instalador em diretórios temporários e, após GREEN, a resolução real pela CLI
OpenCode. Não testar raciocínio privado de LLM.

## Casos automatizados

1. Bundle válido possui os 13 nomes canônicos e contagens corretas.
2. Todos os models pertencem ao inventário fornecido.
3. Inventário sem um model configurado reprova a validação.
4. Primários e subagentes usam modes, hidden e steps coerentes.
5. Allowlists de task não vazam agentes entre planner/developer.
6. Workers e reviewers não podem delegar.
7. Reviewers e readers são read-only.
8. Planner limita escrita a artefatos BMAD.
9. Developer/coder/mechanical bloqueiam commit, push, destrutivos e `.env`.
10. A skill central e seus contratos progressivos existem.
11. Dry-run retorna destinos sem escrever.
12. Instalação copia agentes e protocolo, preservando `opencode.jsonc`.
13. Destino existente falha sem `force`.
14. `force` cria backup antes do overwrite.

## Comandos

```powershell
node --test skills/neres-agentic-bmad/tests/*.test.mjs
npm run validate:skills
npm run generate:catalog
npm test
npm run typecheck
npm run build
npm run check
```

## Prova RED esperada

O teste importa `scripts/opencode-bundle.mjs`, ainda inexistente. A falha
`ERR_MODULE_NOT_FOUND` prova que o contrato de validação/instalação não foi
implementado; falha de setup, teste skipped ou placeholder não conta.
