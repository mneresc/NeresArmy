# S17 — Evidência RED

Data: 2026-08-12

Comando:

```text
node --test skills/neres-agentic-bmad/tests/bmad-bundle.test.mjs skills/neres-agentic-bmad/tests/claude-bundle.test.mjs
```

Resultado: 0 testes passaram e 2 arquivos falharam antes da coleta porque os
módulos públicos `scripts/bmad-bundle.mjs` e `scripts/claude-bundle.mjs` ainda
não existiam (`ERR_MODULE_NOT_FOUND`). Isso prova a ausência dos dois novos
comportamentos sem teste vazio, skip ou asserção relaxada.
