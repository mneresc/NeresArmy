# Neres Agentic BMAD

`neres-agentic-bmad` instala uma arquitetura multiagente no Codex, OpenCode ou
Devin CLI/Desktop. Codex e OpenCode preservam BMAD como source of truth. O bundle
Devin é neutro e pode usar BMAD, skills equivalentes ou o fallback proporcional.

Para instruções de operação por cliente, consulte o
[guia de uso para Codex, OpenCode e Devin](docs/USAGE.md).

## Arquitetura

```text
pedido -> neres-planner -> BMAD -> TaskPackets
                                 |
TaskPackets -> neres-developer -> workers -> T0 gates -> QA/security -> auditor
pedido pequeno -> neres-quick-dev -> QuickPlan -> gate humano -> Dev Nerinhos
```

O protocolo compartilhado usa `ContextPack`, `TaskPacket`, `TaskReport`,
`TestReport`, `QAReport`, `SecurityReport` e `AuditReport`, sem transportar arquivos,
logs ou históricos completos.

## Requisitos

- Codex CLI `0.146.1` ou superior para o bundle Codex.
- OpenCode `1.1.1` ou superior; validado em `1.18.15`.
- Devin CLI/Desktop compatível com project skills e custom subagents; valide a
  versão atual na máquina de trabalho.
- BMAD já instalado no Codex/OpenCode; validado em `6.10.0`. No Devin é opcional.
- Node.js 22+.
- IDs `opencode-go` definidos no bundle disponíveis em `opencode models`.

Os instaladores não atualizam essas ferramentas e não modificam `config.toml` nem
`opencode.jsonc`. O instalador Devin também não modifica `config.json`,
`mcp_config.json`, credenciais ou políticas organizacionais.
Ele recusa sobrescrever os destinos por padrão. Com `--force`, salva cópias em
`<config-dir>/backups/neres-agentic-bmad-<timestamp>` antes da atualização.

## Instalação Codex pelo repositório

```powershell
git clone https://github.com/mneresc/NeresArmy.git
cd NeresArmy
node skills/neres-agentic-bmad/scripts/install-codex.mjs --dry-run
node skills/neres-agentic-bmad/scripts/install-codex.mjs
```

Invocação:

```powershell
codex --profile neres-planner
codex --profile neres-developer
codex --profile neres-quick-dev
```

O instalador adiciona 3 profiles, 11 agentes e a skill em `$CODEX_HOME`, com cap de
6 threads por profile e `approval_policy = "on-request"`. O base `config.toml`
permanece intacto.

## Instalação OpenCode pelo repositório

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

## Instalação Devin pelo repositório

Use o modo projeto no repositório de trabalho:

```powershell
node skills/neres-agentic-bmad/scripts/install-devin.mjs --target project --destination-root <repo-de-trabalho> --dry-run
node skills/neres-agentic-bmad/scripts/install-devin.mjs --target project --destination-root <repo-de-trabalho>
```

Para uma instalação local do usuário Devin CLI/Desktop:

```powershell
node skills/neres-agentic-bmad/scripts/install-devin.mjs --target user --dry-run
node skills/neres-agentic-bmad/scripts/install-devin.mjs --target user
```

No Windows, o modo usuário usa `%APPDATA%\devin`. Ambos os modos gerenciam quatro
skills e onze agents. Use `--force` somente depois do dry-run; o instalador preserva
outros arquivos e cria backup dos nomes substituídos.

## Uso Devin

Invoque `/neres-planner`, `/neres-developer` ou `/neres-quick-dev`. Os entry points
não fixam modelo. Os custom subagents usam aliases estáveis `swe` para execução
normal e `opus` para arquitetura, segurança e auditoria. Antes do uso, confira a
lista atual com `devin models list --format json`; modelos Claude, SWE, Kimi, GLM,
DeepSeek e MiMo só entram quando realmente disponíveis na conta.

No Devin, o agente inventaria skills e MCPs disponíveis, prefere fontes saudáveis e
autoritativas e pode substituir BMAD por skills equivalentes. Essa neutralidade não
se aplica aos bundles Codex/OpenCode, que continuam BMAD-first e usam capacidades
adicionais apenas como apoio.

## Uso OpenCode

```text
Selecione neres-planner e peça: Planeje esta feature com o BMAD proporcional ao risco e gere TaskPackets.
```

```text
Selecione neres-developer e peça: Implemente os TaskPackets ready-for-development e entregue AuditReport.
```

## Model routing OpenCode

| Papel | Default | Tier | Fallback/escalation |
| --- | --- | --- | --- |
| Primários, critic, QA, security | `opencode-go/deepseek-v4-pro` | T2 | GLM-5.2 por architect/auditor ou override |
| Writer, architect, auditor | `opencode-go/glm-5.2` | T4 | `opencode-go/kimi-k3` por override excepcional |
| Reader, mechanical, test | `opencode-go/deepseek-v4-flash` | T1 | `opencode-go/mimo-v2.5` por alteração consciente |
| Coder | `opencode-go/kimi-k2.7-code` | T3 | GLM-5.2 por auditor/override |

Modelos alternativos são documentados no protocolo, mas não geram agentes extras.

## Validação

```powershell
node skills/neres-agentic-bmad/scripts/validate-codex-bundle.mjs
node skills/neres-agentic-bmad/scripts/validate-opencode-bundle.mjs
node skills/neres-agentic-bmad/scripts/validate-devin-bundle.mjs
opencode agent list
opencode debug agent neres-planner
opencode debug agent neres-developer
opencode debug skill
```

Para Codex, faça um smoke real de cada profile com `codex --profile <nome> exec
--ephemeral --skip-git-repo-check "Reply PROFILE_OK only."` e execute `codex
doctor --json` separadamente. O validador do bundle faz o parse estrito dos TOMLs
gerenciados; `--strict-config` também valida a configuração-base do usuário e pode
falhar por campos preexistentes fora do escopo Neres.

Veja [o guia de uso](docs/USAGE.md), [o cookbook](docs/COOKBOOK.md) e o
[guia OpenCode](../../docs/agentic-bmad.md), o
[guia Codex](../../docs/neres-agentic-codex.md) e o
[guia Devin](../../docs/neres-agentic-devin.md).

## Limitação ambiental

Skills globais que já existam no OpenCode também entram no contexto da sessão. Na
máquina de validação, um catálogo global grande adicionou aproximadamente 45 mil a
54 mil tokens mesmo em uma tarefa mínima. A arquitetura mantém seus próprios
handoffs compactos, mas não modifica o catálogo pessoal do usuário.
