# Neres Study Refinery

Compilador didático de fonte fechada para notas e pastas de um vault Obsidian.

## Garantias

- lê somente a nota ou pasta autorizada e seus embeds de imagem internos;
- não segue links, backlinks ou wikilinks;
- não usa web nem conhecimento do modelo como fonte;
- mantém claims ligados a hash, arquivo, heading e trecho;
- nunca sobrescreve originais;
- cria uma V2 separada e artifacts de auditoria;
- não chama provedor externo sem configuração e autorização explícitas.

## Desenvolvimento

```text
npm run check --workspace @neresarmy/neres-study-refinery
npm run build --workspace @neresarmy/neres-study-refinery
```

## Uso local

```text
node dist/cli.js build --vault "D:/Vault" --input "AFO" --input-type folder
```

Use `--dry-run` para inspecionar o plano sem escrita.
