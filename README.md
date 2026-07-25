# NeresArmy

[![license](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

Catálogo público de skills para agentes de código mantido por `mneresc`. Cada
skill vive em uma pasta própria, possui documentação e cookbook próprios e pode ser
instalada isoladamente. A organização se inspira em
[mattpocock/skills](https://github.com/mattpocock/skills): catálogo leve, skills
componíveis e distribuição por seleção.

## Instalar

Escolha skills interativamente para o agente atual:

```powershell
npx skills@latest add mneresc/NeresArmy
```

Instale uma skill específica:

```powershell
npx skills@latest add mneresc/NeresArmy --skill neres-study-refinery
```

Também é possível apontar diretamente para a pasta de uma skill:

```powershell
npx skills@latest add https://github.com/mneresc/NeresArmy/tree/main/skills/neres-study-refinery
```

Consulte o [catálogo completo](docs/CATALOG.md) e a
[matriz de compatibilidade](docs/COMPATIBILITY.md).

## Skills atuais

| Skill | Finalidade | Documentação |
| --- | --- | --- |
| `neres-study-refinery` | Refina notas autorizadas do Obsidian em V2 rastreável, sem usar fontes factuais externas. | [README](skills/neres-study-refinery/README.md) · [Cookbook](skills/neres-study-refinery/docs/COOKBOOK.md) |

## Convenção do catálogo

Uma pasta em `skills/<slug>` representa uma unidade instalável. Ela contém:

```text
skills/<slug>/
├── SKILL.md          # instruções carregadas pelo agente
├── README.md         # documentação humana
├── docs/COOKBOOK.md  # receitas e diagnóstico
├── catalog.json      # categoria, estado e pacote npm opcional
└── package.json      # somente se a skill possuir runtime JavaScript
```

O código executável, quando existir, fica dentro da própria skill. Um pacote npm é
opcional; instalar uma Agent Skill não depende dele.

Veja [como criar uma skill](docs/CREATING-SKILLS.md).

## Desenvolvimento do catálogo

```powershell
npm run validate:skills
npm run generate:catalog
npm test
npm run check
```

Para a instalação local sem `npx`, selecione uma skill ou todas:

```powershell
node scripts/install-skill.mjs --skill neres-study-refinery --target codex
node scripts/install-skill.mjs --all --target all
```

## Licença

MIT.
