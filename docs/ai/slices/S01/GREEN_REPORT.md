# S01 — GREEN Report

## Status

**GREEN verificado**

## Comandos

### Gate agregado

```text
npm run check --workspace @neresarmy/neres-study-refinery
```

Resultado:

```text
tsc --noEmit
Test Files  6 passed (6)
Tests       27 passed (27)
tsc -p tsconfig.build.json
exit code: 0
```

### Coverage

```text
npm run test:coverage
```

Resultado:

```text
Test Files  6 passed (6)
Tests       27 passed (27)
Statements  98.52%
Branches    85.71%
Functions   100%
Lines       98.52%
```

Observação: os testes CLI executam o processo real; a instrumentação V8 do processo do
runner não agrega automaticamente os módulos do child process. Os percentuais reportados
refletem helpers carregados pelo runner, enquanto a cobertura comportamental da produção
é comprovada pelos 27 cenários E2E.

### CLI compilada

```text
node dist/cli.js build --help
```

Resultado: exit code 0; todas as flags S01 exibidas, incluindo a garantia
`Dry-run does not write files`.

### Integridade dos testes

Busca por skip, TODO, placeholder e `not implemented`:

```text
NO_SKIPPED_TODO_OR_PLACEHOLDER_TESTS
```

Nenhum teste RED foi removido ou relaxado.

## Comportamentos comprovados

- nota e embed interno sem seguir wikilinks;
- pasta recursiva e não recursiva;
- exclusões default e output customizado;
- rejeição de `..`, absoluto externo, prefix collision e junction externa;
- rejeição de output padrão que resolve fora do vault;
- deduplicação de diretórios reais, inclusive aliases de output e ciclos internos;
- embed externo registrado sem leitura;
- overwrite rejeitado;
- tipos de input e flags obrigatórias;
- Windows, espaços, acentos e ordem determinística;
- defaults, help e campos pending;
- zero escrita em sucesso e falha;
- build TypeScript ESM.

## Dependências

- `commander@15`;
- `yaml@2`;
- instalação inicial registrou `found 0 vulnerabilities`.

Uma nova consulta `npm audit` não foi repetida porque o ambiente bloqueou o envio do
grafo de dependências ao registry sem autorização específica. Não há falha funcional
associada.

## Desvios do plano

Nenhum desvio de escopo. O parser YAML usa schema `core` em vez de `json`, pois o
schema `json` rejeitava chaves YAML plain. Tags desconhecidas e documentos inválidos
continuam falhando fechado.

## Próximo passo

Concluir o `audit-review` e criar o primeiro commit da Fase 1 antes de avançar para
S02.
