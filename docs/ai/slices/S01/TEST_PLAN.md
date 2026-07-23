# S01 — Plano de testes RED

## Convenção escolhida

Projeto greenfield, sem convenção local anterior.

- Runner: Vitest 4, com TypeScript nativo pelo pipeline Vite.
- Ambiente: Node.js, sem DOM.
- Node mínimo do projeto: 22.12; ambiente atual verificado: 22.18.
- Asserções: APIs públicas do Vitest.
- CLI: processos filhos reais, sem mock de `process.exit`.
- Filesystem: diretórios temporários reais por teste.
- Relógio/rede: não necessários em S01.

Vitest foi escolhido porque suporta TypeScript sem `ts-jest`, execução única para CI e
isolamento adequado. Commander será exercitado por processo real; `exitOverride` pode
ser usado internamente pela implementação, mas os testes não dependerão desse detalhe.

## Tipos de teste

### Contrato

Validar configuração default e shapes públicos `BuildRequest`, `ResolvedScope`,
`DryRunPlan` e erros serializados.

### Integração de filesystem

Criar vaults temporários reais para validar resolução, enumeração, exclusões, Unicode,
ordem, symlinks/junctions e ausência de escrita.

### CLI end-to-end

Executar o binário do pacote com argumentos reais e observar:

- código de saída;
- stdout;
- stderr;
- snapshot do vault.

Não testar helpers privados nem inspecionar chamadas internas.

## Fixtures/factories

Criar factories de teste, não fixtures estáticas duplicadas:

- `createVault()` cria raiz temporária isolada;
- `writeMarkdown(relativePath, content)`;
- `writeImagePlaceholder(relativePath, format)` com bytes mínimos reconhecíveis;
- `createOutsideFile()` para escapes;
- `createDirectoryJunction()` para boundary Windows;
- `snapshotTree()` retorna paths, kinds, sizes e hashes;
- `runCli(args)` executa o entrypoint público e captura resultado.

Fixtures textuais mínimas:

- nota com embed Obsidian;
- árvore recursiva com todas as exclusões;
- caminhos `AFO/Planejamento e Orçamento/Visão Geral.md`;
- diretórios irmãos `Concursos` e `Concursos-backup`.

Nenhuma fixture precisa conter matéria factual real em S01.

## Mapeamento BDD → testes

| BDD | Arquivo/suíte | Tipo | Prova RED esperada |
|---|---|---|---|
| 01 | `tests/cli/note-dry-run.test.ts` | E2E | binário/entrypoint ausente |
| 02–05 | `tests/integration/folder-scope.test.ts` | Integração | resolver de escopo ausente |
| 06–10 | `tests/integration/scope-boundary.test.ts` | Integração/E2E | boundary/erro ausente |
| 11–13 | `tests/cli/input-errors.test.ts` | E2E | validação CLI ausente |
| 14 | `tests/integration/windows-paths.test.ts` | Integração | normalização ausente |
| 15 | `tests/cli/planning-flags.test.ts` | E2E | parsing/plan ausente |
| 16 | `tests/cli/no-write.test.ts` | E2E | dry-run ausente |
| 17 | `tests/integration/determinism.test.ts` | Integração | planner ausente |
| 18 | `tests/cli/help.test.ts` | E2E | CLI ausente |
| 19 | `tests/contracts/default-config.test.ts` | Contrato | config ausente |
| 20 | `tests/cli/failure-atomicity.test.ts` | E2E | error handling ausente |

## Casos detalhados

### `note-dry-run.test.ts`

- lista uma nota e seu embed interno;
- não segue wikilink comum;
- planeja `<dir>/_V2/<stem>-V2.md`;
- retorna `writesPerformed: false`;
- preserva snapshot.

### `folder-scope.test.ts`

- recursivo true;
- recursivo false;
- formatos suportados e unsupported ignorado com motivo;
- todas as exclusões default;
- output customizado excluído;
- deduplicação e ordenação.

### `scope-boundary.test.ts`

- `..` externo;
- caminho absoluto externo;
- sibling com prefixo semelhante;
- symlink/junction externo;
- embed externo;
- output igual ao input;
- output de pasta que contém fontes originais.

### `input-errors.test.ts`

- required flags ausentes;
- note → diretório;
- folder → arquivo;
- note → imagem;
- input inexistente;
- vault inexistente.

### `windows-paths.test.ts`

- backslash e slash;
- letra de drive/casing compatível;
- espaços;
- acentos;
- nomes numerados preservam ordem natural/definida.

### `planning-flags.test.ts`

- profile manual;
- compression;
- diagrams;
- output;
- include-subfolders;
- statuses `pending`.

### `no-write.test.ts`

- sucesso;
- erro;
- nenhum diretório output;
- nenhum lock/cache/temp;
- hashes idênticos.

### `determinism.test.ts`

- mesma entrada duas vezes;
- ordem de criação física diferente produz mesmo plano;
- campos variáveis não entram no contrato semântico.

### `help.test.ts`

- subcomando `build`;
- flags S01;
- texto inequívoco de zero escrita.

### `default-config.test.ts`

- parseia YAML;
- valores exatamente iguais à seção 25;
- exclusões default esperadas;
- schema rejeita enum inválido.

### `failure-atomicity.test.ts`

- exit code não zero;
- stderr seguro;
- stdout não contém conteúdo da nota;
- filesystem idêntico.

## Política para links/reparse points

No Windows, criar junction de diretório, que normalmente não exige modo desenvolvedor.
Se a plataforma rejeitar a criação por política do sistema, o teste registra a limitação
ambiental e executa uma prova equivalente com symlink de arquivo quando possível.

O teste não será `skip` permanente. Em CI Windows deve haver pelo menos uma variante
real; em plataforma sem suporte, a suíte deve falhar com diagnóstico de capacidade,
evitando uma falsa prova verde.

## Comandos a materializar

Após criar o test harness:

- `npm test -- --run`
- `npm run test:coverage`
- `npm run typecheck`

Os nomes serão definidos no `package.json` RED e confirmados por execução. Não há
comando local anterior a preservar.

## Critério de RED válido

- O runner inicia corretamente.
- Os testes são descobertos.
- As factories funcionam.
- As falhas decorrem exclusivamente da ausência dos módulos/comportamentos de S01.
- Nenhum teste está skipped, todo vazio, marcado TODO ou falhando por erro de sintaxe,
  dependência ausente ou configuração inválida.

Para provar RED sem module-not-found global, o harness criará contratos de teste contra
o entrypoint público esperado; um stub de ligação poderá existir apenas para lançar
`ERR_NOT_IMPLEMENTED`, sem lógica de produção e sem satisfazer as asserções.

## Riscos/lacunas

- Testes CLI precisam de um entrypoint executável mínimo para que o RED seja
  comportamental, não erro de import.
- Coverage só será relevante após GREEN; no RED basta comprovar descoberta/execução.
- O formato exato de stdout deve evitar snapshots frágeis: preferir linhas semânticas e
  códigos estáveis.

## Próximo passo

Criar o harness, factories e testes reais com `qa-red-tests`, executar e registrar a
prova RED pelo motivo correto.
