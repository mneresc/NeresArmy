# S18.1 — Plano de testes RED

## Estratégia

Usar os testes de contrato Node existentes, que validam os artefatos realmente
instalados em diretórios temporários. Não serão usados mocks de clientes nem
asserções sobre métodos privados.

## Casos

1. **Codex:** exigir quatro profiles, dezesseis alvos gerenciados e profile
   `neres-bug-doctor` read-only com referência ao `BugReport`, às três rotas e à
   lente `edge-case-hunter`.
2. **OpenCode:** exigir quinze agentes, quatro primários, dezesseis alvos
   gerenciados, restaurar `neres-quick-dev` e incluir `neres-bug-doctor` sem
   permissões de edição.
3. **Devin:** exigir quatro skills de entrada, dezesseis alvos gerenciados e skill
   `neres-bug-doctor` com diagnóstico read-only e handoff explícito para o nosso
   `neres-quick-dev`.
4. **Claude Code:** exigir quinze agentes, quatro entradas, dezesseis alvos e
   entry agent read-only com o mesmo contrato.
5. **Documentação:** ampliar o teste de distribuição trilíngue para exigir
   `neres-bug-doctor` e `neres-quick-dev` nos READMEs e guias de uso.
6. **Regressão:** manter os testes de preservação de configuração, conflitos,
   modelos, BMAD vendorizado e empacotamento.

## Comandos descobertos

```text
node --test tests/codex-bundle.test.mjs tests/opencode-bundle.test.mjs tests/devin-bundle.test.mjs tests/claude-bundle.test.mjs tests/distribution-contract.test.mjs
npm run check --workspace @mneresc/neres-agentic-bmad
```

## Evidência RED esperada

Falhas de contagem e ausência de `neres-bug-doctor` nos bundles atuais. Qualquer
falha de setup, importação ou cache não serve como prova RED.
