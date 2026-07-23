# S01 — RED Test Report

## Resultado

**Status:** RED válido

- Arquivos de teste: 6
- Testes descobertos: 24
- Falharam: 24
- Passaram: 0
- Skipped/TODO/vazios: 0
- Erros de transformação/setup: 0

## Comandos executados

```text
npm install
npm run typecheck
npm test
npm test -- --run tests/integration/scope-boundary.test.ts
```

## Evidência

### Dependências

```text
added 67 packages
found 0 vulnerabilities
```

### Typecheck do harness

```text
> typecheck
> tsc --noEmit

exit code: 0
```

### Suíte completa

```text
Test Files  6 failed (6)
Tests       24 failed (24)
Duration    636ms
```

Falha dominante e esperada:

```text
AssertionError: expected true to be false
expect(result.missingEntrypoint).toBe(false)
```

O helper encontra explicitamente a ausência do entrypoint público esperado
`src/cli.ts` e devolve `missingEntrypoint: true`. Assim, o runner, TypeScript, factories,
filesystem temporário e cenários executam corretamente; a falha prova a ausência do
comportamento público, não um import quebrado.

O contrato de configuração também falha de forma independente:

```text
AssertionError: expected '' to contain 'allow_web: false'
```

Isso prova que `config/default-config.yaml` ainda não foi implementado.

### Boundary real

A suíte isolada de boundary:

```text
Test Files  1 failed (1)
Tests       6 failed (6)
```

As factories criaram e removeram com sucesso:

- arquivo externo;
- sibling com prefixo semelhante;
- junction de diretório para fora do vault;
- embed absoluto externo;
- output colidente.

Não houve falha de permissão/setup na junction Windows.

## Cobertura comportamental RED

- nota e embed;
- pasta recursiva/não recursiva;
- exclusões default e output customizado;
- escape `..`, absoluto, prefix collision e junction;
- embed externo;
- overwrite;
- tipos incompatíveis e input ausente;
- Windows, Unicode e determinismo;
- flags, help, defaults e zero escrita.

## Integridade dos testes

- Nenhum teste importa método privado.
- CLI é observada por processo real quando existir.
- Filesystem usa diretórios temporários reais.
- Todos os temporários são removidos após cada teste.
- Não há rede.
- Não há asserção relaxada para facilitar GREEN.
- Não há teste condicionado à existência da implementação.

## Próximo passo

Usar `tech-plan` para definir o menor conjunto de arquivos de produção que torna os 24
testes GREEN sem antecipar S02.
