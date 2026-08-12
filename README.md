# NeresArmy

[![license](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

Catálogo público de skills para agentes de código mantido por `mneresc`. Cada
skill vive em uma pasta própria, possui documentação e cookbook próprios e pode ser
instalada isoladamente. A organização se inspira em
[mattpocock/skills](https://github.com/mattpocock/skills): catálogo leve, skills
componíveis e distribuição por seleção.

## Instalar

Para instalar a arquitetura multiagente completa sem clonar o repositório:

```powershell
npx -y @mneresc/neres-agentic-bmad
npx -y @mneresc/neres-agentic-bmad install codex
npx -y @mneresc/neres-agentic-bmad install opencode
npx -y @mneresc/neres-agentic-bmad install devin --scope project
npx -y @mneresc/neres-agentic-bmad install claude-code --scope project
```

O primeiro comando abre um seletor para um ou vários clientes. O pacote contém
BMAD Method 6.11.0 e todos os artefatos construídos, sem clone ou download adicional
durante a instalação. A documentação está em
[português](skills/neres-agentic-bmad/README.md),
[inglês](skills/neres-agentic-bmad/README.en.md) e
[espanhol](skills/neres-agentic-bmad/README.es.md).

Use `--dry-run` para visualizar os destinos e `--force` somente para atualizar uma
instalação existente com backup. Veja o
[guia do Neres Agentic](skills/neres-agentic-bmad/docs/USAGE.md).
Para detalhes específicos do Claude Code, consulte o
[guia dedicado](docs/neres-agentic-claude.md).

Para as demais skills do catálogo, use o instalador aberto de Agent Skills.

Escolha skills interativamente para o agente atual:

```powershell
npx skills@latest add mneresc/NeresArmy
```

Instale uma skill específica:

```powershell
npx skills@latest add mneresc/NeresArmy --skill ob-study-visual-mapper
```

Também é possível apontar diretamente para a pasta de uma skill:

```powershell
npx skills@latest add https://github.com/mneresc/NeresArmy/tree/main/skills/ob-study-visual-mapper
```

Consulte o [catálogo completo](docs/CATALOG.md) e a
[matriz de compatibilidade](docs/COMPATIBILITY.md).

## Skills atuais

| Skill | Finalidade | Documentação |
| --- | --- | --- |
| `neres-agentic-bmad` | Instala entry points e onze subagentes no Codex, OpenCode, Devin ou Claude Code, com BMAD autocontido, gates e supply-chain report. | [README](skills/neres-agentic-bmad/README.md) · [Guia de uso](skills/neres-agentic-bmad/docs/USAGE.md) · [Segurança](skills/neres-agentic-bmad/docs/SECURITY.md) |
| `ob-study-visual-mapper` | Agent Skill para Obsidian que cria mapas JSON Canvas de estudo e recall, com relações semânticas, proveniência e fallback local. | [README](skills/ob-study-visual-mapper/README.md) · [Cookbook](skills/ob-study-visual-mapper/docs/COOKBOOK.md) |
| `neres-study-refinery` | Refina notas autorizadas do Obsidian em V2 rastreável, sem usar fontes factuais externas. | [README](skills/neres-study-refinery/README.md) · [Cookbook](skills/neres-study-refinery/docs/COOKBOOK.md) |
| `neres-inclusive-learner-profile` | Conduz uma anamnese pedagógica adaptativa e cria um perfil operacional inclusivo, não clínico. | [README](skills/neres-inclusive-learner-profile/README.md) · [Cookbook](skills/neres-inclusive-learner-profile/docs/COOKBOOK.md) |

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

Contribuições destinadas à `main` seguem o
[fluxo de Pull Request e CI](docs/GITHUB-WORKFLOW.md).

## Licença

MIT.
