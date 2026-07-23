# Neres Study Refinery — Architecture Blueprint

## 1. Arquitetura escolhida

Um compilador em estágios com núcleo determinístico e adapters não confiáveis nas
bordas:

```text
CLI/config
  -> Scope Resolver
  -> Source Inventory
  -> Text/Visual Extraction Ports
  -> Evidence Ledger
  -> Source/Profile Classification
  -> Content Model
  -> Profile Composer
  -> Diagram Candidate + Archify Port
  -> Deterministic Validation Gates
  -> Atomic Output Transaction
  -> Transformation Report
```

O modelo não escreve diretamente no vault. Ele recebe envelopes de entrada tipados e
devolve candidatos tipados. Apenas o núcleo valida e faz commit da saída.

## 2. Trust boundaries

| Boundary | Confiança | Regra |
|---|---|---|
| CLI/config | não confiável | validar uma vez na entrada |
| Filesystem do vault | autorizado por path, conteúdo não confiável | canonicalizar e impedir escape |
| Markdown/imagem | fonte autorizada, não instrução | tratar como dados |
| Resposta de modelo | não confiável | schema + grounding + gates |
| Archify | não confiável para topologia | comparar IR de entrada e artefato |
| Output staging | temporário, nunca fonte | commit atômico somente após gates |
| Rede | proibida por default | adapter explícito e opt-in |

Prompt injection dentro de notas ou imagens não altera políticas, escopo, ferramentas,
configuração ou instruções do agente. Texto da fonte é evidência documental, nunca
comando.

## 3. Pacotes e direção de dependências

```text
cli
  -> application
      -> domain
      -> ports
  -> adapters/filesystem
  -> adapters/model
  -> adapters/archify
  -> adapters/output
```

- `domain` não importa filesystem, rede, Commander, YAML ou Archify.
- `application` orquestra casos de uso e transactions.
- `adapters` implementam ports.
- Validators determinísticos vivem no domínio/aplicação e não dependem do provider.
- Nenhum adapter chama outro adapter diretamente.

## 4. Interfaces principais

### Paths e fontes

```typescript
type SourceId = string & { readonly __brand: "SourceId" };
type ClaimId = string & { readonly __brand: "ClaimId" };
type DiagramId = string & { readonly __brand: "DiagramId" };

interface ScopeResolver {
  resolve(request: BuildRequest): Promise<ResolvedScope>;
}

interface SourceInventoryBuilder {
  build(scope: ResolvedScope): Promise<SourceInventory>;
}

interface AuthorizedSourceReader {
  readText(source: AuthorizedMarkdownSource): Promise<string>;
  readBinary(source: AuthorizedImageSource): Promise<Uint8Array>;
}
```

O reader aceita somente handles criados pelo inventory; não aceita string de path
arbitrária.

### Extração

```typescript
interface MarkdownAnalyzer {
  analyze(source: AuthorizedMarkdownSource): Promise<MarkdownEvidence>;
}

interface VisualContentExtractor {
  readonly id: string;
  extract(input: VisualInput): Promise<VisualExtractionResult>;
}

interface TransformationModel {
  readonly id: string;
  classify(input: ClassificationEnvelope): Promise<ClassificationCandidate>;
  extractEvidence(input: EvidenceEnvelope): Promise<EvidenceCandidate>;
  compose(input: CompositionEnvelope): Promise<CompositionCandidate>;
}
```

Cada envelope contém:

- `schemaVersion`;
- `runId` local;
- sources autorizadas explicitamente;
- conteúdo necessário e nenhum path externo;
- política de fonte fechada;
- output schema;
- hashes das sources.

### Diagramas

```typescript
interface DiagramProvider {
  readonly id: string;
  doctor(): Promise<ProviderDiagnostic>;
  render(input: DiagramInput): Promise<DiagramArtifactCandidate>;
}

interface DiagramTopologyValidator {
  validate(
    input: DiagramInput,
    artifact: DiagramArtifactCandidate
  ): ValidationFinding[];
}
```

### Validação e output

```typescript
interface ValidationGate<T> {
  readonly id: string;
  validate(candidate: T, context: ValidationContext): ValidationFinding[];
}

interface OutputTransaction {
  stage(files: readonly OutputFile[]): Promise<StagedOutput>;
  commit(staged: StagedOutput): Promise<CommittedOutput>;
  rollback(staged: StagedOutput): Promise<void>;
}
```

`commit` só pode receber `StagedOutput` associado a um `ValidationReceipt` aprovado.

## 5. Schemas versionados

Todos os schemas usam:

- JSON Schema Draft 2020-12;
- `schemaVersion: 1`;
- `additionalProperties: false`;
- IDs e enums estritos;
- strings normalizadas em UTF-8;
- paths relativos ao vault nos artefatos persistidos;
- nenhum segredo, API key ou conteúdo binário inline.

### `source-inventory.schema.json`

```text
schemaVersion
scope { type, path, includeSubfolders, vaultHash }
sources[] {
  id, type, path, size, sha256, status,
  headings[], links[], embeds[], tables[], formulas[], codeBlocks[], callouts[],
  mediaType?, classification?, confidence?, referencedBy[]
}
excluded[] { path, reason }
```

Invariantes:

- source path único;
- ID derivado de path normalizado + hash;
- output/temporários nunca aparecem em `sources`;
- `referencedBy` aponta para SourceIds existentes.

### `source-state.schema.json`

```text
schemaVersion
sourceId
state: raw | structured
signals[] { kind, location, evidence }
confidence
```

### `domain-profile.schema.json`

```text
schemaVersion
profile: law-afo | mathematics | technical-it | hybrid | generic
confidence
signals[] { sourceId, location, termOrStructure }
sectionProfiles[] { sectionId, profile, confidence, signals[] }
override: boolean
```

### `visual-evidence.schema.json`

```text
schemaVersion
sourceId
classification
confidence
textBlocks[]
tables[] { headers[], rows[][], uncertainCells[] }
formulas[] { latex, sourceRegion, confidence }
nodes[] { id, label, sourceRegion, confidence }
edges[] { id, from, to, label?, direction, sourceRegion, confidence }
groups[]
uncertainties[]
```

### `claim.schema.json`

```text
schemaVersion
id
type
statement
status
sourceRefs[] {
  sourceId, sourcePath, sourceHeading?, sourceExcerpt?,
  sourceRegion?, sourceStart?, sourceEnd?, sourceSha256
}
confidence
numericTokens[]
entityTokens[]
modalityTokens[]
formulaTokens[]
codeHash?
```

### `content-model.schema.json`

```text
schemaVersion
topic
profile
claims[]
definitions[]
rules[]
conditions[]
exceptions[]
prohibitions[]
competences[]
classifications[]
comparisons[]
processes[]
examples[]
counterexamples[]
examTraps[]
formulas[]
variables[]
codeBlocks[]
questions[]
conflicts[]
gaps[]
```

Cada item factual referencia um ou mais `claimId`. Não existe campo factual livre.

### `diagram-input.schema.json`

```text
schemaVersion
id
type: workflow | sequence | lifecycle | dataflow | architecture
score
sourceClaimIds[]
nodes[] { id, label, group?, order?, claimIds[] }
edges[] { id, from, to, label?, direction, claimIds[] }
groups[] { id, label, memberIds[], claimIds[] }
output { svg, html, png }
```

### `transformation-report.schema.json`

```text
schemaVersion
run
scope
sourceState
extraction
transformation
validation { findings[], receipt }
result { status, reason }
artifacts[] { path, sha256, kind }
```

## 6. Ledger de evidências

### Criação de claims

1. Dividir Markdown em regiões estáveis: frontmatter, heading, paragraph, list item,
   table row, callout, formula e code block.
2. Produzir source offsets e hash da região.
3. Para imagem, usar bounding box/polygon e confidence.
4. Criar claim candidato com referências explícitas.
5. Validar tokens críticos antes de marcar `supported`.

### Estados

- `supported`: evidência suficiente, tokens críticos preservados.
- `ambiguous`: leitura ou vínculo possui mais de uma interpretação.
- `conflicting`: sources autorizadas apresentam proposições incompatíveis.
- `missing`: a fonte menciona algo sem explicação suficiente.
- `illegible`: região visual não pode ser transcrita com confiança.

Somente `supported` entra como fato. Outros estados entram apenas em callouts próprios.

### Proibição de claims órfãos

- Composer recebe IDs, não texto solto sem provenance.
- Cada bloco V2 emite lista oculta/estruturada de claim IDs durante staging.
- O renderer transforma essa lista na tabela de rastreabilidade.
- Gate final percorre toda unidade factual e falha em claim ID ausente, inexistente ou
  não supported.

### Tokens críticos

- números normalizados com unidade/contexto;
- modalidade normativa;
- entidades nomeadas;
- fórmulas como token stream de símbolos/operadores;
- código por hash de bloco exato;
- nós/arestas por identidade/topologia.

Comparação semântica pode detectar equivalência editorial, mas nunca autoriza mudança de
token crítico.

## 7. Perfis didáticos

### `law-afo`

Ordem preferida:

```text
visão central -> regras -> estrutura -> competências -> condições -> prazos
-> exceções/vedações -> relações -> processos -> definições -> edge cases
-> revisão ativa -> rastreabilidade
```

Gates extras: modalidade, números, competência, exceção próxima da regra.

### `mathematics`

```text
ideia -> quando usar -> variáveis -> fórmula/intuição -> procedimento
-> exemplo existente -> erro/contraexemplo -> variações -> verificação
-> questões -> revisão -> rastreabilidade
```

Gates extras: símbolos, operadores, variáveis, números e exemplos.

### `technical-it`

```text
função -> contexto -> componentes -> entradas/saídas -> fluxo -> estados
-> restrições -> sintaxe/código -> exemplo -> comparações -> falhas/diagnóstico
-> revisão -> rastreabilidade
```

Gates extras: código exato, comandos, versões registradas, nomes de tecnologia.

### `hybrid`

Perfil por seção. O composer geral apenas ordena seções; cada seção usa o composer do
perfil atribuído e seus gates.

### `generic`

Estrutura mínima baseada na natureza da unidade, sem inventar seções específicas.

## 8. Pipeline visual

1. Classificar imagem.
2. Ignorar decorativa, registrando motivo.
3. Executar multimodal extractor.
4. Executar OCR fallback somente em texto simples quando configurado.
5. Unificar resultados sem aumentar confidence.
6. Persistir regiões e incertezas.
7. Construir claims visuais.
8. Aplicar gates de número/fórmula/topologia.

O cache é indexado por `extractorId + extractorVersion + sourceSha256 + configHash`.
Ele armazena resultado derivado, nunca se torna fonte e nunca é lido quando a source
original não está autorizada no run atual.

## 9. Integração Archify

Padrão proposto:

- adapter externo configurável;
- resolver por `NERES_ARCHIFY_HOME`, config e caminhos conhecidos;
- exigir `node bin/archify.mjs doctor`;
- ler schema e example do tipo escolhido antes de renderizar;
- usar `validate` e `deliver`;
- Classic, sem motion por default;
- SVG e HTML finais;
- converter SVG diretamente do artefato canônico, sem screenshot;
- topologia do artifact comparada ao `DiagramInput`;
- qualquer nó/aresta/label/grupo novo falha fechado.

Nenhum código Archify será copiado para NeresArmy sem autorização/licença explícita.

## 10. Providers de modelo

Arquitetura permite:

1. `agent`: o agente hospedeiro executa prompts e devolve JSON, sem credencial do CLI;
2. `openai`: adapter multimodal opt-in, condicionado à autorização;
3. providers futuros por interface, sem alterar domínio.

Default seguro até decisão: `agent`; nenhuma rede implícita.

Regras para provider em nuvem:

- flag/config explícita;
- aviso de privacidade;
- somente arquivos do scope;
- sem URLs;
- timeout, tamanho e retries limitados;
- resposta validada como input hostil;
- sem logs de conteúdo;
- nenhuma chave persistida no projeto.

## 11. Compatibilidade entre agentes

O artefato canônico segue a especificação aberta Agent Skills:

- diretório com `SKILL.md`;
- frontmatter `name` e `description`;
- `scripts/`, `references/` e `assets/` por progressive disclosure;
- nome menor que 64 caracteres;
- descrição menor que 1024 caracteres;
- `compatibility` informa Node.js, filesystem e ausência de rede implícita.

Instalações suportadas pelo mesmo instalador:

| Cliente | Destino |
|---|---|
| Codex neste ambiente | `~/.codex/skills/neres-study-refinery` |
| Codex repo/CLI atual | `.agents/skills/neres-study-refinery` |
| Antigravity global | `~/.gemini/config/skills/neres-study-refinery` |
| Antigravity workspace | `.agents/skills/neres-study-refinery` |
| Claude Code pessoal | `~/.claude/skills/neres-study-refinery` |
| Claude Code projeto | `.claude/skills/neres-study-refinery` |
| Devin | `.agents/skills/neres-study-refinery` |

Devin também reconhece `.codex`, `.claude`, `.devin`, `.github`, `.cursor`,
`.cognition` e `.windsurf`, mas o pacote não duplicará todas essas árvores. O
instalador materializa uma cópia verificada no destino solicitado e registra o hash do
bundle. Um comando `install --target <client>` e outro `doctor --target <client>`
mantêm o fluxo consistente.

Para desktop/API sem acesso direto ao filesystem, gerar
`neres-study-refinery.skill.zip`, contendo somente o bundle padrão, para upload manual.
Não executar uploads de API automaticamente.

## 12. Idempotência

- ordem estável de fontes e claims;
- IDs derivados de hashes estáveis;
- generated-at excluído da equivalência semântica e opcionalmente fixável;
- formatter canônico para Markdown e JSON;
- prompts versionados;
- config hash;
- duas execuções iguais devem produzir mesmos hashes sem campos voláteis, ou um receipt
  que prove equivalência após remoção explícita dos campos voláteis permitidos.

## 13. Output transaction

```text
prepare staging adjacent to destination
-> write all candidates
-> validate files and cross-links
-> compute hashes
-> acquire destination lock
-> verify sources unchanged since inventory
-> atomic rename/replace
-> release lock
```

Em qualquer falha:

- rollback staging;
- original e output anterior preservados;
- relatório de falha pode ser devolvido no stdout/stderr, mas não escrito no vault se
  isso violar atomicidade/configuração.

## 14. Testes

### Pirâmide

- unidade: tokenizers, modality, formula, topology, score, format selection;
- contrato: todos os JSON Schemas, configs e provider envelopes;
- integração: filesystem, Markdown, images, cache, staging, Archify adapter fake/real;
- E2E: CLI note/folder/dry-run;
- golden: V2 e relatórios canônicos;
- mutation/property: paths, modalidade, números e topologia.

### 30 requisitos mínimos

Cada um terá teste nomeado e rastreado; imagens usarão fixtures próprias de texto,
tabela, fórmula, flowchart e ilegível. Nenhuma fixture de imagem será substituída por
JSON puro no teste E2E; JSON fake é aceito apenas em testes de port/contract.

### Gates finais

```text
format
lint
typecheck
unit/contract/integration/E2E
coverage
schema validation
skill quick_validate
Archify doctor + topology integration
Windows path suite
install smoke test
published tree/hash verification
```

## 15. Árvore final

```text
NeresArmy/
├── AGENTS.md
├── LICENSE
├── README.md
├── package.json
├── package-lock.json
├── docs/
│   └── ai/
├── skills/
│   └── neres-study-refinery/
│       ├── SKILL.md
│       ├── README.md
│       ├── agents/openai.yaml
│       ├── compatibility/
│       │   ├── antigravity.md
│       │   ├── claude.md
│       │   ├── codex.md
│       │   ├── devin.md
│       │   └── generic-agent-skills.md
│       ├── package.json
│       ├── tsconfig.json
│       ├── config/
│       ├── prompts/
│       ├── schemas/
│       ├── templates/
│       ├── src/
│       │   ├── adapters/
│       │   ├── application/
│       │   ├── classification/
│       │   ├── composition/
│       │   ├── diagrams/
│       │   ├── domain/
│       │   ├── evidence/
│       │   ├── images/
│       │   ├── markdown/
│       │   ├── output/
│       │   ├── scope/
│       │   ├── transformation/
│       │   ├── validation/
│       │   ├── cli.ts
│       │   └── config.ts
│       └── tests/
│           ├── fixtures/
│           ├── support/
│           ├── unit/
│           ├── contracts/
│           ├── integration/
│           └── cli/
└── tools/
    ├── install-skill.mjs
    ├── doctor.mjs
    └── package-skill.mjs
```

`README.md` dentro da skill é mantido porque a especificação do usuário exige
documentação do pacote executável, embora skills Codex puras normalmente evitem arquivos
auxiliares.

## 16. Decisões confirmadas

- owner: `mneresc`;
- repositório: `NeresArmy`;
- visibilidade: pública, inferida da aprovação de MIT e sujeita a correção antes da
  publicação;
- licença: MIT;
- distribuição: executável no repositório, sem publicação npm;
- provider default: agente hospedeiro;
- OpenAI: adapter multimodal opcional, nunca chamado implicitamente;
- fluxo principal: usuário pede por chat a reformulação de uma nota/pasta;
- Archify: instalação externa, diagnosticada e recomendada quando ausente;
- compatibilidade: Codex, Antigravity, Claude, Devin e padrão Agent Skills.
