# Neres Study Refinery

[![npm version](https://img.shields.io/npm/v/%40mneresc%2Fneres-study-refinery?label=npm)](https://www.npmjs.com/package/@mneresc/neres-study-refinery)

Compilador didático de fonte fechada para notas e pastas de um vault Obsidian.

## Garantias

- lê somente a nota ou pasta autorizada e seus embeds de imagem internos;
- não segue links, backlinks ou wikilinks;
- não usa web nem conhecimento do modelo como fonte;
- mantém claims ligados a hash, arquivo, heading e trecho;
- nunca sobrescreve originais;
- cria uma V2 separada e artifacts de auditoria;
- valida números, entidades, modalidade normativa, fórmulas e código;
- cria frontmatter, marcadores `claimId`, relatório e visão geral de pasta;
- não chama provedor externo sem configuração e autorização explícitas.

## Desenvolvimento

```text
npm run check --workspace @mneresc/neres-study-refinery
npm run build --workspace @mneresc/neres-study-refinery
```

## Instalação via npm

```text
npm install --global @mneresc/neres-study-refinery
neres-study-refinery --help
```

## Uso local

```powershell
$Vault = "<CAMINHO_ABSOLUTO_DO_VAULT>"
$Entrada = "<PASTA_RELATIVA_NO_VAULT>"

neres-study-refinery build `
  --vault $Vault `
  --input $Entrada `
  --input-type folder `
  --dry-run
```

Use `--dry-run` para inspecionar o plano sem escrita.

Use `--config <arquivo.yaml>` para sobrescrever parcialmente a configuração
padrão. Chaves desconhecidas e valores inválidos são recusados.

## Execução visual

- `none` (padrão): nenhuma chamada externa.
- `agent-manifest`: o próprio agente descreve as imagens em um manifesto preso ao
  caminho e SHA-256 de cada arquivo.
- `openai`: exige simultaneamente `--visual-provider openai`,
  `--allow-external-ai`, `OPENAI_API_KEY` e um modelo explícito.

## Archify

Diagramas usam uma instalação externa confiável do `tt-a1i/archify`, quando
detectada. Valide-a com `node <archify>/bin/archify.mjs doctor`. Sem Archify, a
nota textual continua e recebe um aviso.

Consulte o [Cookbook](../../docs/COOKBOOK.md) para receitas completas.
