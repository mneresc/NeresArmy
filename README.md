# NeresArmy

Skills de código e estudo mantidas por `mneresc`.

## Skills

### neres-study-refinery

Compilador didático de fonte fechada para transformar notas ou pastas autorizadas de
um vault Obsidian em versões V2 rastreáveis, sem completar conteúdo com pesquisa ou
conhecimento externo.

Estado atual: Fase 2 concluída — escopo seguro, inventário, evidência, classificação
e composição textual V2.

```powershell
npm install
npm run build --workspace @neresarmy/neres-study-refinery
node skills/neres-study-refinery/dist/cli.js build `
  --vault "D:\Obsidian\Concursos" `
  --input "AFO" `
  --input-type folder
```

Adicione `--dry-run` para inspecionar o plano sem escrita.

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
