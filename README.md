# NeresArmy

[![npm version](https://img.shields.io/npm/v/%40mneresc%2Fneres-study-refinery?label=npm)](https://www.npmjs.com/package/@mneresc/neres-study-refinery)
[![license](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

Skills de código e estudo mantidas por `mneresc`.

## Skills

### neres-study-refinery

Compilador didático de fonte fechada para transformar notas ou pastas autorizadas de
um vault Obsidian em versões V2 rastreáveis, sem completar conteúdo com pesquisa ou
conhecimento externo.

Estado atual: implementação completa — inclui escopo fechado, inventário,
classificação, evidência textual/visual, composição conservadora, validações finais,
relatório, visão geral, escrita atômica e integração externa opcional com Archify.

Pacote público: [`@mneresc/neres-study-refinery`](https://www.npmjs.com/package/@mneresc/neres-study-refinery).
Veja o [Cookbook](docs/COOKBOOK.md) para receitas completas de instalação, execução,
imagens, OpenAI opcional, Archify e diagnóstico.

### Instalação do CLI

```powershell
npm install --global @mneresc/neres-study-refinery
neres-study-refinery --version
```

### Primeiro dry-run

Defina valores locais apenas na sua sessão:

```powershell
$Vault = "<CAMINHO_ABSOLUTO_DO_VAULT>"
$Entrada = "<PASTA_RELATIVA_NO_VAULT>"

neres-study-refinery build `
  --vault $Vault `
  --input $Entrada `
  --input-type folder `
  --dry-run
```

Remova `--dry-run` somente depois de revisar o plano. A saída é sempre separada;
os originais não são sobrescritos.

Para evidência visual sem envio externo, forneça um manifest ligado ao SHA-256:

```powershell
$Vault = "<CAMINHO_ABSOLUTO_DO_VAULT>"
$Nota = "<NOTA_RELATIVA.md>"
$Manifesto = "<MANIFESTO_RELATIVO.json>"

neres-study-refinery build `
  --vault $Vault `
  --input $Nota `
  --input-type note `
  --visual-provider agent-manifest `
  --visual-manifest $Manifesto `
  --dry-run
```

O adaptador OpenAI exige `--visual-provider openai`,
`--allow-external-ai`, `OPENAI_API_KEY` e `--openai-model` (ou
`NERES_OPENAI_MODEL`). Somente então a imagem selecionada é enviada. O request usa
`store: false`, mas continua sujeito às políticas da API e não equivale a execução
local.

### Archify

A skill detecta instalações em:

- `NERES_ARCHIFY_PATH`;
- `~/.codex/skills/archify/bin/archify.mjs`;
- `~/.agents/skills/archify/bin/archify.mjs`.

Também aceita `--archify-path`. Confie apenas em uma instalação conhecida, pois esse
arquivo será executado como código local. Valide com:

```powershell
node "<caminho>\bin\archify.mjs" doctor
```

Se ausente, instale a skill `tt-a1i/archify` pelo gerenciador do seu agente e rode o
doctor. A V2 textual continua funcionando sem Archify; candidatos gráficos recebem
um aviso.

## Instalação rápida com npx

O CLI oficial usa `skills` no plural. Para instalar no projeto atual e escolher o
agente interativamente:

```powershell
npx skills add https://github.com/mneresc/NeresArmy/tree/main/skills/neres-study-refinery
```

Para disponibilizar a skill globalmente no Codex, Antigravity, Claude Code e
Devin for Terminal:

```powershell
npx skills add https://github.com/mneresc/NeresArmy/tree/main/skills/neres-study-refinery `
  --global `
  --agent codex `
  --agent antigravity `
  --agent antigravity-cli `
  --agent claude-code `
  --agent devin
```

Confirme a instalação global com:

```powershell
npx skills list --global
```

## Instalação multiagente

```powershell
npm run build
node scripts/install-skill.mjs --target all
```

O instalador cobre Codex, diretório aberto `.agents/skills`, Antigravity e Claude
Code. Para Claude Desktop ou outro cliente que exija upload, use o pacote `.skill`.
Veja [docs/COMPATIBILITY.md](docs/COMPATIBILITY.md).

## Compatibilidade

- Codex CLI/Desktop;
- Antigravity CLI/IDE;
- Claude Code/Desktop;
- Devin;
- clientes compatíveis com o padrão Agent Skills.

## Desenvolvimento

```powershell
npm install
npm run check --workspace @mneresc/neres-study-refinery
```

## Licença

MIT.
