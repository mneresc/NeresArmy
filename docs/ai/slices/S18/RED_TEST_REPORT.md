# S18.1 — Relatório RED

## Comando

```text
node --test tests/codex-bundle.test.mjs tests/opencode-bundle.test.mjs tests/devin-bundle.test.mjs tests/claude-bundle.test.mjs tests/distribution-contract.test.mjs
```

## Resultado

- 19 testes executados;
- 7 passaram;
- 12 falharam pelo comportamento ausente.

## Falhas decisivas

- Codex ainda expõe 3 profiles, não 4;
- OpenCode ainda expõe 13 agentes, não 15, confirmando também a ausência
  preexistente de `neres-quick-dev`;
- Devin ainda expõe 3 entry skills, não 4;
- Claude Code ainda expõe 14 agentes e 3 entradas;
- instaladores retornam as contagens antigas;
- documentação ainda não contém `neres-bug-doctor`.

As falhas são de contrato e ausência de artefato, não de setup, cache ou comando.
Nenhum teste está vazio, skipped ou acoplado a método privado.
