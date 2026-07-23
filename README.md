# NeresArmy

Skills de código e estudo mantidas por `mneresc`.

## Skills

### neres-study-refinery

Compilador didático de fonte fechada para transformar notas ou pastas autorizadas de
um vault Obsidian em versões V2 rastreáveis, sem completar conteúdo com pesquisa ou
conhecimento externo.

Estado atual: Fase 3 concluída — inclui evidência visual por manifest do agente e
adaptador OpenAI multimodal explicitamente opt-in.

```powershell
npm install
npm run build --workspace @neresarmy/neres-study-refinery
node skills/neres-study-refinery/dist/cli.js build `
  --vault "D:\Obsidian\Concursos" `
  --input "AFO" `
  --input-type folder
```

Adicione `--dry-run` para inspecionar o plano sem escrita.

Para evidência visual sem envio externo, forneça um manifest ligado ao SHA-256:

```powershell
node skills/neres-study-refinery/dist/cli.js build `
  --vault "D:\Obsidian\Concursos" `
  --input "AFO\Nota.md" `
  --input-type note `
  --visual-provider agent-manifest `
  --visual-manifest "visual-manifest.json"
```

O adaptador OpenAI exige `--visual-provider openai`,
`--allow-external-ai`, `OPENAI_API_KEY` e `--openai-model` (ou
`NERES_OPENAI_MODEL`). Somente então a imagem selecionada é enviada. O request usa
`store: false`, mas continua sujeito às políticas da API e não equivale a execução
local.

## Compatibilidade planejada

- Codex CLI/Desktop;
- Antigravity CLI/IDE;
- Claude Code/Desktop;
- Devin;
- clientes compatíveis com o padrão Agent Skills.

## Desenvolvimento

```powershell
npm install
npm run check --workspace @neresarmy/neres-study-refinery
```

## Licença

MIT.
