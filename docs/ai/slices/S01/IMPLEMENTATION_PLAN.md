# S01 — Implementation Plan

## Objetivo

Levar os 24 testes RED a GREEN com o menor núcleo correto de CLI, configuração,
boundary de filesystem, enumeração e plano dry-run. Não implementar transformação.

## Decisões técnicas

### Runtime

- Node.js `>=22.12`.
- TypeScript ESM com `moduleResolution: NodeNext`.
- `tsc` para build e typecheck.
- Nenhuma dependência nativa, facilitando Windows e instalação por agentes.

### CLI

- `commander` para subcomando, opções, choices, help e erros consistentes.
- Expor uma função pública `run(argv, io)` testável, mas manter os testes E2E pelo
  entrypoint real.
- Converter erros conhecidos em códigos estáveis e exit code `2`.
- Erro inesperado usa exit code `1`, sem imprimir conteúdo de fonte.

### YAML

- `yaml` (`eemeli/yaml`) para ler `default-config.yaml`.
- `parseDocument` com chaves únicas e schema JSON; rejeitar documentos múltiplos,
  custom tags, warnings relevantes e tipos inesperados.
- Validação estrutural manual mínima em S01; JSON Schema completo entra em S02.

### Boundary

- Normalizar separadores de input antes de `path.resolve`.
- Usar `realpath` para vault e inputs existentes.
- Verificar descendência por `path.relative` e segmentos.
- Para outputs inexistentes, resolver o ancestral existente mais próximo, validar esse
  ancestral e reaplicar os segmentos restantes.
- Comparação case-insensitive no Windows.
- Durante walk, validar `realpath` de cada entrada antes de abri-la.
- Junction/symlink externo é rejeitado e nunca percorrido.

### Dry-run

- O planner é read-only por tipo e não recebe uma interface de escrita.
- Coletar lista estável de Markdown/imagens e exclusões.
- Nota: ler apenas o Markdown para encontrar embeds; não abrir imagens.
- Folder: enumerar extensões suportadas, sem ler conteúdo.
- Formatar saída humana determinística, sem timestamp.
- `writesPerformed` é sempre `false`.

### Escrita atômica

- Criar apenas o contrato/guard de output em S01.
- A implementação efetiva entra quando S04 escrever V2.
- Nenhum diretório/cache/lock/temp é criado pelo caminho dry-run.

## Dependências novas

| Dependência | Tipo | Justificativa |
|---|---|---|
| `commander` | produção | Parsing/help/erros de CLI maduros; evita parser manual frágil. |
| `yaml` | produção | Parser YAML 1.2 com diagnóstico e rejeição de chaves duplicadas. |

Não adicionar glob, filesystem walker, schema validator, logger ou framework de DI em
S01. Vitest/TypeScript já existem como infraestrutura RED.

## Contratos

### `BuildRequest`

```typescript
type InputType = "note" | "folder";
type Profile = "auto" | "law-afo" | "mathematics" | "technical-it" | "hybrid" | "generic";
type Compression = "conservative" | "balanced" | "aggressive";
type DiagramMode = "auto" | "off";

interface BuildRequest {
  vault: string;
  input: string;
  inputType: InputType;
  includeSubfolders: boolean;
  profile: Profile;
  output?: string;
  compression: Compression;
  diagrams: DiagramMode;
  dryRun: true;
}
```

S01 rejeita execução sem `--dry-run`; build com escrita será habilitado em S04.

### `ResolvedScope`

```typescript
interface ResolvedScope {
  vaultRoot: string;
  inputPath: string;
  inputType: InputType;
  includeSubfolders: boolean;
  outputPath: string;
  excludedDirectoryNames: readonly string[];
}
```

### `DryRunPlan`

```typescript
interface PlannedEntry {
  path: string;
  kind: "markdown" | "image";
  origin: "input" | "folder" | "embed";
}

interface RejectedEntry {
  path: string;
  reason: "excluded-directory" | "outside-vault" | "unsupported-type";
}

interface DryRunPlan {
  scope: ResolvedScope;
  entries: PlannedEntry[];
  rejectedEntries: RejectedEntry[];
  requestedProfile: Profile;
  compression: Compression;
  diagrams: DiagramMode;
  sourceStateStatus: "pending";
  diagramCandidateStatus: "pending";
  conflictStatus: "pending";
  writesPerformed: false;
}
```

### Erros estáveis

- `ERR_USAGE`
- `ERR_VAULT_NOT_FOUND`
- `ERR_INPUT_NOT_FOUND`
- `ERR_INPUT_TYPE`
- `ERR_OUTSIDE_VAULT`
- `ERR_OUTPUT_COLLISION`
- `ERR_CONFIG`
- `ERR_DRY_RUN_REQUIRED`
- `ERR_INTERNAL`

## Arquivos previstos

```text
skills/neres-study-refinery/
├── config/
│   └── default-config.yaml
├── src/
│   ├── cli.ts
│   ├── config.ts
│   ├── contracts.ts
│   ├── errors.ts
│   ├── markdown/
│   │   └── embeds.ts
│   ├── planning/
│   │   ├── dry-run.ts
│   │   └── format-plan.ts
│   └── scope/
│       ├── boundary.ts
│       ├── resolve-scope.ts
│       └── walk-scope.ts
├── package.json
└── tsconfig.json
```

## Ordem de implementação

1. Adicionar dependências de produção e scripts `build`/`check`.
2. Materializar `default-config.yaml`.
3. Criar contracts e erros estáveis.
4. Implementar boundary e resolução de output.
5. Implementar walk determinístico e exclusões.
6. Implementar extração limitada de embeds Obsidian.
7. Construir `DryRunPlan` puro e formatter.
8. Implementar CLI/entrypoint.
9. Executar testes focados e corrigir somente comportamento S01.
10. Executar suite completa, typecheck, build e coverage.
11. Atualizar GREEN report e realizar commit da Fase 1.

## Não objetivos

- Não criar claims, templates V2 ou relatórios.
- Não abrir imagens.
- Não classificar notas/perfis automaticamente.
- Não chamar rede/modelo/Archify.
- Não escrever no vault.
- Não adicionar JSON Schema completo antes de S02.
- Não modificar ou relaxar testes RED.

## Riscos e mitigação

1. **Embed Obsidian ambíguo:** reconhecer apenas `![[target]]`, remover alias/fragmento
   e resolver relativamente à nota e ao vault; target não resolvido é rejeitado.
2. **Junction durante walk:** `Dirent` pode parecer diretório; sempre aplicar
   `lstat/realpath` e boundary antes de recursão.
3. **Output inexistente:** usar ancestral existente; nunca chamar `realpath` direto em
   path inexistente como única validação.
4. **Ordem natural:** usar comparator determinístico com locale fixo e tie-break por
   code points; não depender do locale da máquina.
5. **stdout:** manter labels estáveis e caminhos relativos com `/` para portabilidade.

## Validações

```text
npm run typecheck
npm test
npm run test:coverage
npm run build
node --experimental-strip-types src/cli.ts build --help
```

Além disso:

- confirmar `24 passed`;
- confirmar zero skipped/TODO;
- confirmar snapshot idêntico em sucesso e erro;
- confirmar junction real no Windows;
- revisar `npm audit`;
- revisar diff para ausência de S02+.

## Gate humano

Implementação bloqueada até aprovação explícita deste plano. As decisões de provider,
GitHub e publicação permanecem fora de S01 e não impedem aprovar este slice.
