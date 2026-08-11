# Neres Agentic BMAD

`neres-agentic-bmad` instala uma arquitetura multiagente no OpenCode sem substituir o
BMAD existente. No uso diário, selecione somente `neres-planner` ou
`neres-developer`; os demais agentes ficam ocultos e são chamados por allowlists.

## Arquitetura

```text
pedido -> neres-planner -> BMAD -> TaskPackets
                                 |
TaskPackets -> neres-developer -> workers -> T0 gates -> QA/security -> auditor
```

O protocolo compartilhado usa `ContextPack`, `TaskPacket`, `TaskReport`,
`TestReport`, `QAReport`, `SecurityReport` e `AuditReport`, sem transportar arquivos,
logs ou históricos completos.

## Requisitos

- OpenCode `1.1.1` ou superior; validado em `1.18.15`.
- BMAD já instalado; validado em `6.10.0`.
- Node.js 22+.
- IDs `opencode-go` definidos no bundle disponíveis em `opencode models`.

O instalador não atualiza essas ferramentas e não modifica `opencode.jsonc`.
Ele recusa sobrescrever os destinos por padrão. Com `--force`, salva cópias em
`<config-dir>/backups/neres-agentic-bmad-<timestamp>` antes da atualização.

## Instalação pelo repositório

```powershell
git clone https://github.com/mneresc/NeresArmy.git
cd NeresArmy
node skills/neres-agentic-bmad/scripts/install-opencode.mjs --dry-run
node skills/neres-agentic-bmad/scripts/install-opencode.mjs
```

Para instalar primeiro a skill pelo catálogo:

```powershell
npx skills@latest add mneresc/NeresArmy --skill neres-agentic-bmad --agent opencode --global --yes --copy
```

Depois execute `scripts/install-opencode.mjs` a partir da pasta instalada. Use
`--config-dir <diretório>` para projeto/teste e `--force` somente após inspecionar os
destinos; atualizações forçadas criam backup.

## Uso

```text
Selecione neres-planner e peça: Planeje esta feature com o BMAD proporcional ao risco e gere TaskPackets.
```

```text
Selecione neres-developer e peça: Implemente os TaskPackets ready-for-development e entregue AuditReport.
```

## Model routing

| Papel | Default | Tier | Fallback/escalation |
| --- | --- | --- | --- |
| Primários, critic, QA, security | `opencode-go/deepseek-v4-pro` | T2 | GLM-5.2 por architect/auditor ou override |
| Writer, architect, auditor | `opencode-go/glm-5.2` | T4 | `opencode-go/kimi-k3` por override excepcional |
| Reader, mechanical, test | `opencode-go/deepseek-v4-flash` | T1 | `opencode-go/mimo-v2.5` por alteração consciente |
| Coder | `opencode-go/kimi-k2.7-code` | T3 | GLM-5.2 por auditor/override |

Modelos alternativos são documentados no protocolo, mas não geram agentes extras.

## Validação

```powershell
node skills/neres-agentic-bmad/scripts/validate-opencode-bundle.mjs
opencode agent list
opencode debug agent neres-planner
opencode debug agent neres-developer
opencode debug skill
```

Veja [o cookbook](docs/COOKBOOK.md) e o
[guia operacional](../../docs/agentic-bmad.md).

## Limitação ambiental

Skills globais que já existam no OpenCode também entram no contexto da sessão. Na
máquina de validação, um catálogo global grande adicionou aproximadamente 45 mil a
54 mil tokens mesmo em uma tarefa mínima. A arquitetura mantém seus próprios
handoffs compactos, mas não modifica o catálogo pessoal do usuário.
