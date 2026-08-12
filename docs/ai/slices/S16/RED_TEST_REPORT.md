# S16 — RED test report

## Comando

`node --test skills/neres-agentic-bmad/tests/npx-cli.test.mjs`

## Resultado

RED confirmado: 0/6 testes passaram.

- O manifest ainda retornava `private: true`.
- `scripts/neres-agentic.mjs` não existia.
- Help, validação negativa e os três dispatches falharam com
  `MODULE_NOT_FOUND`, antes de escrita em qualquer destino.

Os testes exercitam manifest, processo real, exit codes e output público. Não usam
skip, placeholder ou método privado.
