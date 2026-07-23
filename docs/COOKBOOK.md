# Cookbook — Neres Study Refinery

Receitas práticas para instalar e executar
[`@mneresc/neres-study-refinery`](https://www.npmjs.com/package/@mneresc/neres-study-refinery)
sem expor caminhos locais e sem ampliar o escopo autorizado.

## Antes de começar

- Node.js `22.12` ou superior.
- Um vault Obsidian que você está autorizado a processar.
- Uma nota ou pasta relativa ao vault.
- `--dry-run` na primeira execução de cada novo escopo.

Os exemplos usam placeholders. Substitua-os apenas na sua sessão local:

```powershell
$Vault = "<CAMINHO_ABSOLUTO_DO_VAULT>"
$Pasta = "<PASTA_RELATIVA_NO_VAULT>"
$Nota = "<NOTA_RELATIVA.md>"
```

O caminho passado em `--vault` é absoluto. `--input`, `--output` e
`--visual-manifest` são relativos ao vault.

## Receita 1 — instalar o CLI

Instalação global:

```powershell
npm install --global @mneresc/neres-study-refinery
neres-study-refinery --version
neres-study-refinery --help
```

Execução pontual, sem instalação global:

```powershell
npx --yes @mneresc/neres-study-refinery@latest --help
```

## Receita 2 — instalar a skill no agente

O pacote npm fornece o executável. A instalação abaixo fornece ao agente o
`SKILL.md`, as políticas e os recursos auxiliares:

```powershell
npx skills add https://github.com/mneresc/NeresArmy/tree/main/skills/neres-study-refinery
```

Instalação global em agentes específicos:

```powershell
npx skills add https://github.com/mneresc/NeresArmy/tree/main/skills/neres-study-refinery `
  --global `
  --agent codex `
  --agent antigravity `
  --agent antigravity-cli `
  --agent claude-code `
  --agent devin
```

## Receita 3 — planejar uma pasta sem escrever

```powershell
$Vault = "<CAMINHO_ABSOLUTO_DO_VAULT>"
$Pasta = "<PASTA_RELATIVA_NO_VAULT>"

neres-study-refinery build `
  --vault $Vault `
  --input $Pasta `
  --input-type folder `
  --dry-run
```

Por padrão, subpastas são incluídas. Para limitar a pasta ao primeiro nível:

```powershell
neres-study-refinery build `
  --vault $Vault `
  --input $Pasta `
  --input-type folder `
  --include-subfolders false `
  --dry-run
```

## Receita 4 — planejar uma única nota

```powershell
$Vault = "<CAMINHO_ABSOLUTO_DO_VAULT>"
$Nota = "<NOTA_RELATIVA.md>"

neres-study-refinery build `
  --vault $Vault `
  --input $Nota `
  --input-type note `
  --dry-run
```

A nota autorizada pode trazer imagens incorporadas. A skill não segue links,
backlinks ou wikilinks para ampliar o escopo.

## Receita 5 — gerar a V2

Revise primeiro a saída do `--dry-run`. Depois execute o mesmo comando sem essa
flag:

```powershell
neres-study-refinery build `
  --vault $Vault `
  --input $Pasta `
  --input-type folder
```

A saída padrão fica em uma pasta separada. Os originais não são sobrescritos.

## Receita 6 — escolher perfil e compressão

```powershell
neres-study-refinery build `
  --vault $Vault `
  --input $Nota `
  --input-type note `
  --profile mathematics `
  --compression conservative `
  --dry-run
```

Perfis disponíveis:

| Perfil | Uso |
|---|---|
| `auto` | Detecta o perfil a partir da fonte autorizada. |
| `law-afo` | Conteúdo normativo e financeiro. |
| `mathematics` | Fórmulas, demonstrações e exercícios. |
| `technical-it` | Código, APIs, diagnóstico e arquitetura. |
| `hybrid` | Mistura controlada de domínios. |
| `generic` | Estrutura neutra. |

Compressões disponíveis: `conservative`, `balanced` e `aggressive`.

## Receita 7 — escolher uma saída separada

```powershell
$Saida = "<SAIDA_RELATIVA_NO_VAULT>"

neres-study-refinery build `
  --vault $Vault `
  --input $Pasta `
  --input-type folder `
  --output $Saida `
  --dry-run
```

A saída não pode ser a própria fonte nem apontar para fora do vault.

## Receita 8 — aplicar configuração YAML

Crie um arquivo com apenas os campos que deseja alterar:

```yaml
classification:
  profile: technical-it

transformation:
  compression: conservative

diagrams:
  mode: off
```

Execute:

```powershell
$Config = "<ARQUIVO_DE_CONFIGURACAO.yaml>"

neres-study-refinery --config $Config build `
  --vault $Vault `
  --input $Pasta `
  --input-type folder `
  --dry-run
```

Chaves desconhecidas e valores inválidos são recusados.

## Receita 9 — usar evidência visual produzida pelo agente

O manifesto precisa estar ligado ao caminho e ao SHA-256 da imagem:

```powershell
$Manifesto = "<MANIFESTO_RELATIVO.json>"

neres-study-refinery build `
  --vault $Vault `
  --input $Nota `
  --input-type note `
  --visual-provider agent-manifest `
  --visual-manifest $Manifesto `
  --dry-run
```

Esse modo não envia a imagem a uma API externa.

## Receita 10 — autorizar OpenAI explicitamente

O provedor permanece desligado até que todos os controles abaixo estejam
presentes:

```powershell
$env:OPENAI_API_KEY = "<CHAVE_CONFIGURADA_LOCALMENTE>"
$Modelo = "<MODELO_MULTIMODAL>"

neres-study-refinery build `
  --vault $Vault `
  --input $Nota `
  --input-type note `
  --visual-provider openai `
  --allow-external-ai `
  --openai-model $Modelo `
  --dry-run
```

Somente imagens selecionadas dentro do escopo autorizado são enviadas. O request
usa `store: false`, mas continua sujeito às políticas da API.

## Receita 11 — validar e usar Archify

Informe uma instalação confiável do `tt-a1i/archify`:

```powershell
$Archify = "<CAMINHO_DO_ARCHIFY>\bin\archify.mjs"
node $Archify doctor
```

Depois:

```powershell
neres-study-refinery build `
  --vault $Vault `
  --input $Nota `
  --input-type note `
  --archify-path $Archify `
  --diagrams auto `
  --dry-run
```

Sem Archify, a V2 textual continua funcionando e recebe um aviso quando houver
candidato gráfico.

## Receita 12 — atualizar ou remover

Atualizar o CLI:

```powershell
npm update --global @mneresc/neres-study-refinery
```

Remover o CLI:

```powershell
npm uninstall --global @mneresc/neres-study-refinery
```

Listar skills instaladas:

```powershell
npx skills list --global
```

## Diagnóstico rápido

| Sintoma | Verificação |
|---|---|
| `command not found` | Confirme `node --version`, reinstale o pacote global e reabra o terminal. |
| Entrada não encontrada | Confirme que `--input` é relativo ao vault e que o tipo corresponde a `note` ou `folder`. |
| Nenhum arquivo escrito | Verifique se `--dry-run` ainda está presente. |
| Provedor OpenAI recusado | Confirme a chave local, o modelo explícito e `--allow-external-ai`. |
| Archify ausente | Execute `doctor` na instalação informada ou prossiga apenas com a V2 textual. |
| Saída rejeitada | Escolha um destino separado, interno ao vault e diferente da fonte. |

## Contrato de segurança

- O vault é tratado como fonte fechada.
- A skill não usa web nem conhecimento do modelo para completar conteúdo.
- Links internos não ampliam o escopo.
- Originais nunca são sobrescritos.
- Chamadas externas exigem configuração e autorização explícitas.
- Claims, números, modalidade, fórmulas, código e topologia permanecem
  rastreáveis até a fonte autorizada.
