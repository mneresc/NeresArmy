# S01 — BDD

## Feature

Como usuário do Neres Study Refinery, quero inspecionar antecipadamente o escopo e a
saída de uma execução para ter certeza de que somente fontes autorizadas serão lidas e
que o dry-run não modificará meu vault.

## Cenário 01 — Dry-run de nota individual

**Dado** um vault com `AFO/01-PPA.md`
**E** a nota incorpora `AFO/00-PPA.png`
**Quando** executo `build` para essa nota com `--input-type note --dry-run`
**Então** a execução termina com sucesso
**E** lista a nota como única fonte Markdown
**E** lista a imagem incorporada autorizada
**E** planeja `AFO/_V2/01-PPA-V2.md`
**E** informa que nenhuma escrita foi realizada.

## Cenário 02 — Dry-run de pasta recursiva

**Dado** um vault com Markdown e imagens dentro de `AFO` e suas subpastas
**Quando** executo dry-run para `AFO` com subpastas habilitadas
**Então** todos os arquivos suportados e autorizados são listados uma única vez
**E** os caminhos aparecem em ordem determinística
**E** a saída default planejada é `AFO/_V2`.

## Cenário 03 — Pasta sem recursão

**Dado** um vault com `AFO/resumo.md` e `AFO/Subtema/detalhe.md`
**Quando** executo dry-run para `AFO` com subpastas desabilitadas
**Então** `AFO/resumo.md` é listado
**E** `AFO/Subtema/detalhe.md` não é listado.

## Cenário 04 — Exclusões padrão

**Dado** que cada diretório excluído por padrão contém um arquivo Markdown
**Quando** executo dry-run para a pasta ancestral
**Então** nenhum arquivo de `.obsidian`, `.trash`, `.git`, `node_modules`, `dist`,
`build`, `coverage`, `_V2`, `V2`, `.generated`, `assets-generated` ou
`archify-output` é tratado como fonte
**E** cada exclusão é contabilizada com motivo.

## Cenário 05 — Output customizado não volta ao escopo

**Dado** um output customizado dentro do vault e dentro da árvore pesquisada
**Quando** executo dry-run da pasta
**Então** a árvore de output é excluída das fontes
**E** o output planejado permanece o caminho solicitado.

## Cenário 06 — Escape por segmento pai

**Dado** um arquivo existente fora do vault
**Quando** uso `../` para indicá-lo como input
**Então** a execução falha antes de ler o arquivo externo
**E** informa que o input está fora do escopo
**E** não realiza escrita.

## Cenário 07 — Prefixo textual semelhante não é descendente

**Dado** os diretórios irmãos `Concursos` e `Concursos-backup`
**Quando** o vault é `Concursos` e o input está em `Concursos-backup`
**Então** a execução rejeita o input como externo ao vault.

## Cenário 08 — Link que escapa do vault

**Dado** um link ou reparse point dentro do vault cujo destino está fora dele
**Quando** executo dry-run sobre esse caminho
**Então** a execução falha fechada ou registra a entrada como rejeitada antes de ler
seu conteúdo
**E** informa o escape de escopo.

## Cenário 09 — Embed externo

**Dado** uma nota autorizada que incorpora uma imagem fora do vault
**Quando** executo dry-run da nota
**Então** a imagem é registrada como rejeitada
**E** seu conteúdo não é lido
**E** a nota continua sendo a única fonte Markdown.

## Cenário 10 — Output colide com o original

**Dado** uma nota autorizada
**Quando** informo a própria nota como output
**Então** a execução falha antes de escrever
**E** informa risco de sobrescrita do original.

## Cenário 11 — Tipo de input incompatível

**Dado** um caminho de arquivo Markdown
**Quando** informo `--input-type folder`
**Então** a execução falha com erro de tipo.

## Cenário 12 — Tipo note exige Markdown

**Dado** um arquivo de imagem autorizado
**Quando** informo `--input-type note` para a imagem
**Então** a execução falha informando que uma nota `.md` era esperada.

## Cenário 13 — Caminho inexistente

**Dado** um vault válido
**Quando** informo um input inexistente
**Então** a execução falha com mensagem segura que identifica o caminho
**E** não cria output.

## Cenário 14 — Caminhos Windows e acentos

**Dado** um vault em um caminho com drive, espaços e caracteres acentuados
**Quando** executo dry-run usando separadores Windows
**Então** a execução termina com sucesso
**E** preserva os nomes Unicode no plano.

## Cenário 15 — Flags de planejamento

**Dado** um input válido
**Quando** informo perfil, compressão, modo de diagrama e output explicitamente
**Então** o dry-run apresenta exatamente os valores solicitados
**E** marca como `pending` apenas análises ainda não executadas.

## Cenário 16 — Zero escrita no dry-run

**Dado** um snapshot do vault antes da execução
**Quando** executo qualquer dry-run bem-sucedido
**Então** o snapshot de arquivos, diretórios, tamanhos e hashes permanece idêntico
**E** não existem caches, locks, temporários ou diretórios de saída novos.

## Cenário 17 — Ordem estável

**Dado** o mesmo vault sem alterações
**Quando** executo o mesmo dry-run duas vezes
**Então** os planos são semanticamente equivalentes
**E** a ordem de arquivos e exclusões é idêntica.

## Cenário 18 — Ajuda pública da CLI

**Dado** o executável instalado localmente
**Quando** solicito ajuda para `build`
**Então** a ajuda lista todos os argumentos aceitos em S01
**E** explica que `--dry-run` não escreve.

## Cenário 19 — Configuração padrão

**Dado** que não informo arquivo de configuração nem overrides
**Quando** executo dry-run
**Então** os valores efetivos correspondem à configuração padrão da especificação
**E** o plano informa `balanced`, perfil `auto`, diagramas `auto` e saída separada.

## Cenário 20 — Falha não deixa estado parcial

**Dado** um snapshot do vault
**Quando** uma validação de input ou output falha
**Então** o processo retorna código diferente de zero
**E** não altera o snapshot
**E** a mensagem não expõe conteúdo da nota.

## Rastreabilidade

| Critério de aceite | Cenários |
|---|---|
| AC01 | 01 |
| AC02 | 02, 03 |
| AC03 | 04 |
| AC04 | 06, 07 |
| AC05 | 08 |
| AC06 | 10 |
| AC07 | 01, 02 |
| AC08 | 14 |
| AC09 | 02, 17 |
| AC10 | 16, 20 |
| AC11 | 19 |
| AC12 | 03 |
| AC13 | 11, 12 |
| AC14 | 09 |
| AC15 | 18 |

## Pontos de revisão

- Cenário 08 aceita rejeição localizada durante walk ou falha da execução inteira;
  ambos preservam o boundary. O plano de testes escolherá a política pública consistente.
- Os campos `pending` do cenário 15 desaparecem progressivamente em S02, S03 e S07.

## Próximo passo

Criar o plano de testes RED com `qa-red-plan`.
