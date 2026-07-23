# S01 — Escopo seguro e dry-run

## Objetivo observável

Permitir que o usuário aponte uma nota ou pasta dentro de um vault Obsidian e veja,
por meio de `build --dry-run`, exatamente qual escopo seria processado e onde a saída
seria escrita, com zero alterações no filesystem.

## Em escopo

- Estrutura inicial do pacote e da skill.
- Node.js + TypeScript com suporte a Windows.
- Comando `neres-study-refinery build`.
- Argumentos:
  - `--vault <path>`;
  - `--input <path>`;
  - `--input-type note|folder`;
  - `--include-subfolders true|false`;
  - `--profile <profile>`;
  - `--output <path>`;
  - `--compression conservative|balanced|aggressive`;
  - `--diagrams auto|off`;
  - `--dry-run`.
- Carregamento da configuração padrão.
- Resolução de uma nota `.md`.
- Enumeração de Markdown e imagens suportadas em uma pasta.
- Exclusões padrão e prevenção de recursão na pasta de saída.
- Canonicalização de caminhos, inclusive separadores Windows.
- Rejeição de caminho fora do vault, arquivo inexistente, tipo incompatível e output
  igual/contido no original de forma insegura.
- Planejamento da saída default separada.
- Resultado dry-run com:
  - escopo;
  - arquivos Markdown;
  - imagens;
  - exclusões e motivos;
  - perfil solicitado ou `auto`;
  - estados/classificações ainda `pending` quando dependerem de slices posteriores;
  - saída planejada;
  - diagramas e conflitos ainda `pending`;
  - confirmação explícita de que nenhuma escrita ocorreu.
- Abstração de escrita atômica e guard contra overwrite, coberta por testes unitários,
  mas ainda não acionada para produzir V2.

## Fora de escopo

- Inventário semântico completo.
- Leitura de wikilinks ou backlinks.
- Classificação real `raw|structured`.
- Classificação automática de perfil.
- Extração de claims.
- Composição ou escrita de V2.
- Processamento multimodal.
- Diagramas/Archify.
- Relatório final.
- Provider de modelo.
- Publicação ou instalação.

## Comportamento esperado

### Nota

1. Resolver `vault` para caminho absoluto e existente.
2. Resolver `input` relativamente ao vault, mesmo quando recebido com `\` ou `/`.
3. Confirmar que o caminho canônico permanece dentro do vault.
4. Confirmar extensão `.md`.
5. Localizar apenas imagens incorporadas cuja resolução permaneça no vault; neste
   slice, registrar o embed e o caminho resolvido sem extrair conteúdo.
6. Planejar por padrão `<diretório-da-nota>/_V2/<nome>-V2.md`.

### Pasta

1. Confirmar diretório autorizado.
2. Enumerar `.md`, `.png`, `.jpg`, `.jpeg` e `.webp`.
3. Respeitar `--include-subfolders`.
4. Excluir diretórios configurados, incluindo qualquer output resolvido.
5. Ordenar caminhos de forma estável e case-insensitive no Windows.
6. Planejar por padrão `<input>/_V2`.

### Segurança de caminhos

- Rejeitar caminhos absolutos de input fora do vault.
- Rejeitar `..` que escape do vault.
- Comparar limites por segmentos, não por prefixo textual.
- Tratar casing de forma compatível com Windows.
- Resolver links simbólicos/reparse points quando a plataforma permitir; se a
  resolução não puder ser comprovada, falhar fechado.
- Nunca considerar a pasta `_V2` uma fonte.
- Nunca criar diretório, arquivo, lock ou cache em dry-run.

### Erros

- Erros de uso/configuração retornam código de processo diferente de zero.
- Mensagens identificam argumento/caminho e motivo sem incluir conteúdo das notas.
- Uma falha não deixa arquivo parcial.

## Critérios de aceite

1. Um dry-run de nota válida retorna sucesso e lista somente a nota e embeds
   autorizados.
2. Um dry-run de pasta válida respeita recursão e exclusões.
3. `_V2`, `.obsidian`, `.trash`, `.git`, `node_modules`, `dist`, `build`,
   `coverage`, `V2`, `.generated`, `assets-generated` e `archify-output` não entram
   como fontes por padrão.
4. Input com `../` para fora do vault falha antes de qualquer leitura externa.
5. Um symlink/reparse point que escape do vault falha fechado.
6. Output igual ao input ou capaz de sobrescrever original é rejeitado.
7. O output default de nota e pasta segue a especificação.
8. Caminhos Windows, espaços e acentos funcionam.
9. A ordem dos arquivos é determinística.
10. Snapshot completo do filesystem antes/depois comprova zero escrita no dry-run.
11. A configuração default corresponde à seção 25 da especificação.
12. `--include-subfolders false` não enumera descendentes.
13. Tipo `note` apontando para pasta e tipo `folder` apontando para arquivo falham.
14. Imagem externa referenciada é registrada como rejeitada e não é lida.
15. A ajuda da CLI documenta todos os argumentos aceitos neste slice.

## Contratos afetados

### `BuildRequest`

- vault;
- input;
- inputType;
- includeSubfolders;
- profile;
- output;
- compression;
- diagrams;
- dryRun.

### `ResolvedScope`

- vaultRoot;
- inputPath;
- inputType;
- includeSubfolders;
- outputPath;
- authorizedRoots;
- exclusions.

### `DryRunPlan`

- scope;
- markdownFiles;
- imageFiles;
- rejectedEntries;
- requestedProfile;
- output;
- sourceStateStatus;
- diagramCandidateStatus;
- conflictStatus;
- writesPerformed.

### `RefineryError`

- stable code;
- user-safe message;
- optional path/argument;
- cause somente para diagnóstico interno.

Os tipos e schemas completos serão definidos no plano técnico; nenhum campo factual de
nota será serializado em mensagens de erro.

## Riscos específicos

- `path.resolve` sozinho não impede prefix collisions (`vault` versus `vault-old`).
- `realpath` pode falhar para output ainda inexistente; validar o ancestral existente e
  reconstruir os segmentos restantes.
- Reparse points do Windows exigem teste de integração condicional quando o ambiente
  não permitir criá-los.
- Uma pasta output configurada fora do input mas dentro do vault ainda precisa ser
  excluída do source walk.
- Parsing precoce de Markdown pode ler embeds externos; neste slice, resolver apenas
  a referência e aplicar boundary antes de abrir o arquivo.

## Pontos de revisão humana

- Confirmar que campos `pending` no dry-run são aceitáveis até S02/S03/S07.
- Confirmar os argumentos públicos e o formato textual inicial da CLI.
- Aprovar o plano técnico antes da implementação.

## Lacunas bloqueadoras para BDD

Nenhuma. As decisões de GitHub, licença, provider, privacidade, npm e Archify não mudam
o comportamento de S01.

## Próximo passo

Converter esta especificação em cenários Given/When/Then com `qa-bdd`.
