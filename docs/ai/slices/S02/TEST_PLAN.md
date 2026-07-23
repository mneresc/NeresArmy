# S02 — Plano de testes

## Suítes

- `inventory-and-evidence.test.ts`: inventário, hash, elementos Markdown e claims;
- `classification.test.ts`: raw/structured, perfis automáticos e override;
- `composition.test.ts`: preservação e headings dos perfis;
- `build-output.test.ts`: CLI real, nota/pasta, original intacto, artifacts e
  idempotência.

## Estratégia RED

Os testes importam os módulos públicos esperados. O RED válido é ausência desses
módulos ou comportamento ainda não implementado. Nenhum stub de produção será criado
para tornar o runner verde.

## Factories

Reutilizar vaults temporários reais de S01. Os conteúdos são mínimos e factuais apenas
para comprovar organização; não dependem de conhecimento externo.

## Gates

```text
npm test -- tests/phase2
npm run typecheck
npm run check
```

Nenhum teste pode ser skipped, TODO ou relaxado após o RED.
