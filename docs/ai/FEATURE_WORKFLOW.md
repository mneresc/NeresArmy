# Neres Study Refinery — Feature Workflow

## Estado

- Etapa atual: `pm-intake`
- Implementação: não iniciada
- Aprovação humana para implementação: pendente
- Fonte de requisitos: `pasted-text-1.txt`, 31 seções

## Objetivo

Construir `neres-study-refinery`, uma skill e CLI TypeScript/Node.js para agentes de
código transformarem notas ou pastas autorizadas de um vault Obsidian em versões V2
mais enxutas e didáticas, sem introduzir fatos externos e sem sobrescrever originais.

Publicar a skill como primeira integrante do monorepo GitHub `mneresc/NeresArmy` e
instalá-la em `~/.codex/skills/neres-study-refinery`.

## Usuários e ambientes

- Usuário final estudando para concursos em um vault Obsidian.
- Agentes compatíveis com skills Markdown: Codex, Claude Code, OpenCode e equivalentes.
- Windows como plataforma obrigatória.
- Node.js/TypeScript para toda parte executável.

## Escopo funcional

1. Resolver escopo autorizado para nota ou pasta.
2. Inventariar Markdown, imagens, embeds, links, tabelas, fórmulas, código e callouts.
3. Excluir diretórios configurados e impedir leitura fora do escopo.
4. Classificar fonte como `raw` ou `structured`.
5. Classificar perfil como `law-afo`, `mathematics`, `technical-it`, `hybrid` ou
   `generic`, com override manual.
6. Extrair evidências textuais e visuais para um modelo factual intermediário.
7. Compor uma V2 por nota usando formatos adequados ao perfil.
8. Preservar números, modalidade normativa, fórmulas, código, exemplos, callouts,
   pegadinhas, edge cases, lacunas e divergências.
9. Gerar diagramas apenas quando a pontuação autorizar, usando Archify.
10. Validar grounding, números, entidades, modalidade, fórmulas, código, topologia,
    fonte externa, sobrescrita e idempotência.
11. Escrever saída separada, overview opcional, assets e relatório de auditoria.
12. Oferecer `dry-run` sem escrita.
13. Expor CLI compatível com os exemplos `neres-study-refinery build`.
14. Fornecer `SKILL.md`, metadados de agente, configuração, prompts, schemas,
    templates, código, fixtures e testes.

## Invariantes de fonte fechada

- Nenhuma afirmação factual entra na V2 sem evidência autorizada.
- Apenas claims `supported` podem aparecer como fatos.
- Conteúdo ambíguo, conflitante, ausente ou ilegível deve ser marcado.
- Rede, conhecimento geral do modelo, backlinks, wikilinks externos, V2 anterior e
  temporários não são fontes.
- Uma integração de modelo pode processar o conteúdo somente como mecanismo de
  transformação; a resposta continua sujeita ao ledger de evidências e às validações.
- Originais nunca são sobrescritos por padrão.

## Entradas e saídas públicas

### CLI

- Comando: `neres-study-refinery build`
- Parâmetros mínimos: `--vault`, `--input`, `--input-type`
- Parâmetros especificados: `--profile`, `--output`, `--compression`,
  `--diagrams`, `--include-subfolders`, `--dry-run`
- Códigos de saída e formato JSON para automação ainda precisam ser detalhados.

### Configuração

- Arquivo YAML com blocos `input`, `scope`, `classification`, `output`,
  `transformation`, `images`, `diagrams` e `validation`.
- Precedência proposta: defaults < arquivo informado < argumentos CLI.

### Contratos intermediários

- `SourceInventory`
- `SourceState`
- `DomainProfile`
- `VisualEvidence`
- `Claim`
- `ContentModel`
- `DiagramInput`
- `TransformationReport`

Cada contrato terá TypeScript, JSON Schema e fixtures válidas/inválidas.

### Abstrações externas

- `VisualContentExtractor`
- `TransformationModel`
- `DiagramProvider`
- `FileSystemBoundary`

## Não escopo

- Pesquisa ou consulta de conteúdo externo.
- Correção jurídica ou conceitual automática.
- Criação de exemplos, pegadinhas, vantagens, limitações ou hipóteses ausentes.
- Modificação silenciosa das fontes.
- Publicação automática no npm sem autorização específica.
- Alteração ou incorporação do código-fonte do Archify sem decisão explícita.

## Requisitos de qualidade

- TDD e testes comportamentais.
- Validações determinísticas sempre que possível.
- Caminhos Windows e caracteres acentuados.
- Idempotência sem depender de timestamps variáveis.
- Saídas atômicas e falha fechada.
- Nenhum teste skipped, vazio ou falso.
- Commits separados por fase.

## Riscos principais

1. **Transformação semântica não determinística**: mitigar com adapters, schemas,
   ledger de evidências e validadores pós-modelo.
2. **Grounding por sobreposição textual insuficiente**: claims parafraseados exigem
   vínculo explícito a trechos e auditoria conservadora.
3. **Extração visual**: OCR isolado não cobre tabelas, fórmulas e topologia; exigir
   extractor multimodal e confidences.
4. **Privacidade do vault**: chamadas de modelo em nuvem devem ser opt-in e claramente
   configuradas.
5. **Isolamento de escopo**: symlinks, `..`, caminhos absolutos, case-insensitivity e
   reparse points do Windows exigem canonicalização e testes.
6. **Archify local**: localização/versionamento da skill externa precisa de contrato
   explícito e diagnóstico.
7. **Idempotência**: timestamps, ordem de arquivos e respostas de modelo precisam ser
   normalizados ou excluídos da equivalência semântica.
8. **Repositório agregador**: separar o formato instalável da skill do pacote npm para
   evitar duplicação e publicação incompleta.

## Decisões pendentes do usuário

1. Confirmar owner `mneresc` e visibilidade de `NeresArmy`.
2. Definir licença, caso público.
3. Autorizar ou proibir envio opt-in de conteúdo do vault a APIs de IA.
4. Definir o primeiro provider multimodal suportado em produção.
5. Definir se haverá publicação npm nesta entrega.
6. Confirmar integração externa do Archify por caminho/configuração, sem vendoring.

## Evidência de conclusão esperada

- Todos os 30 casos mínimos possuem testes executados e verdes.
- Build, typecheck, lint, schemas e validador de skill passam.
- Testes reais da CLI cobrem nota, pasta e `dry-run`.
- Um fixture visual por classe crítica prova o adapter multimodal/fake e as validações.
- A instalação em `~/.codex/skills/neres-study-refinery` passa `quick_validate.py`.
- O repositório `mneresc/NeresArmy` existe com histórico por fases e conteúdo publicado.
- O diff publicado coincide com o estado local verificado.

## Próximo passo

Executar `pm-slices` após resolver ou assumir explicitamente as decisões pendentes.
