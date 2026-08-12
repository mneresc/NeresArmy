# Cookbook — Neres Agentic BMAD

Para o fluxo cotidiano e exemplos por Codex CLI/Desktop, OpenCode e Devin
CLI/Desktop, comece pelo [guia de uso](USAGE.md). Este cookbook concentra
atualização, falhas e diagnóstico.

## Instalação rápida e atualização via npx

```powershell
npx -y @mneresc/neres-agentic-bmad install <codex|opencode|devin> --dry-run
```

Remova `--dry-run` para instalar. Para atualizar destinos já gerenciados, mantenha
o mesmo comando e acrescente `--force`; o instalador cria backup antes da troca.
Use `npx -y @mneresc/neres-agentic-bmad --help` para opções específicas.

## Entry points Codex

```powershell
codex --profile neres-planner
codex --profile neres-developer
codex --profile neres-quick-dev
```

Profiles são as interfaces principais. Os TOMLs em `$CODEX_HOME/agents` são
Nerinhos delegados e não devem ser usados como entry points cotidianos.

## Preview Codex

```powershell
node scripts/install-codex.mjs --dry-run
node scripts/install-codex.mjs
```

Use `--force` somente após inspecionar conflitos; o instalador cria backup e não
edita `config.toml`.

## Quick-dev

Use somente para mudança tiny/small, local e de baixo risco. A primeira rodada deve
terminar em QuickPlan sem editar. Inicie uma segunda rodada com autorização explícita
para implementar. Se o escopo crescer, use `neres-planner`.

## Planejar uma mudança pequena

Selecione `neres-planner` e descreva o bug. O planner deve classificar a mudança,
delegar leitura local barata, usar o workflow BMAD mínimo disponível e gerar um
TaskPacket explícito. Architect e security não entram sem gatilho de risco.

## Planejar uma feature relevante

Peça ao planner para usar os artefatos BMAD já existentes. Ele deve localizar o
project context, selecionar as skills BMAD instaladas, produzir stories/specs e
submeter o plano a critic; architect entra apenas em decisão cross-cutting.

## Desenvolver

Selecione `neres-developer` com a story e os TaskPackets. O developer resolve
dependências, pede um ContextPack local, escolhe mechanical ou coder, executa gates
T0, chama QA e security quando o risco exigir, e termina com auditoria PASS/REWORK.

## Preview e destino de teste OpenCode

```powershell
node scripts/install-opencode.mjs --dry-run
node scripts/install-opencode.mjs --config-dir .tmp/opencode
```

## Preview e instalação Devin

No repositório de trabalho:

```powershell
node scripts/install-devin.mjs --target project --destination-root <repo-de-trabalho> --dry-run
node scripts/install-devin.mjs --target project --destination-root <repo-de-trabalho>
```

Para o usuário do Devin CLI/Desktop, troque por `--target user`. O instalador não
altera a configuração nem o catálogo MCP do Devin.

## Descobrir capacidades no Devin

```powershell
devin models list --format json
devin skills list
devin mcp list
```

Use `/neres-planner`, `/neres-developer` ou `/neres-quick-dev`. A neutralidade de
skills, modelos e MCPs é exclusiva do Devin: BMAD pode ser substituído por uma skill
equivalente que cubra a fase. Codex e OpenCode permanecem BMAD-first.

## Atualizar uma instalação existente

Primeiro rode dry-run e inspecione os arquivos atuais. Depois:

```powershell
node scripts/install-opencode.mjs --force
```

O resultado informa `backupDirectory`. Sem `--force`, qualquer destino existente
interrompe a instalação antes de escrita.

## Model não disponível

Execute `codex debug models`, `opencode models` ou `devin models list --format json`
e compare os IDs completos. O
validador falha fechado. Para
trocar um modelo, edite o asset do agente no pacote, atualize a documentação/fixture e
rode todos os testes; não use um nome de marketing sem provider/model-id real.

## Agente não aparece

No Codex, rode `codex doctor --json`, confirme o TOML em `$CODEX_HOME/agents` e
procure startup warnings com o nome do agente. Cada TOML precisa de `name`,
`description` e `developer_instructions` como strings top-level.

No OpenCode:

1. Execute `opencode debug paths` e confirme o config root.
2. Execute `opencode agent list`.
3. Execute `opencode debug agent <nome>`.
4. Confirme extensão `.md`, frontmatter e `mode`.
5. Reinstale apenas após dry-run; não edite o JSON global para compensar sintaxe
   inválida.

No Devin, execute `devin skills list` e confirme `.agents/skills` ou o diretório
global. Para custom subagents, confira `.agents/agents` ou `%APPDATA%\devin\agents`.
Como essa superfície é experimental, valide também a versão do CLI e a política da
organização antes de atribuir uma falha ao bundle.

## Skill não aparece

Execute `opencode debug skill` e confirme
`~/.config/opencode/skills/agentic-bmad/SKILL.md`. Verifique se o agente permite a
skill `agentic-bmad`.

No Devin, use `devin skills list`. Apenas uma skill fica ativa por vez; invoque o
entry point da fase e deixe que ele leia o protocolo versionado no bundle.

## Escalation

Após duas tentativas sem sucesso, teste persistente sem causa, mudança fora de
`allowed_files`, requisito contraditório ou novo risco crítico, pare o worker. Retorne
`NEEDS_ESCALATION`; architect/auditor GLM-5.2 ou override explícito redefine o gap.
Kimi K3 exige override explícito de sessão e não é default de worker.

No Devin, os aliases `swe` e `opus` resolvem a família disponível na conta. Não
copie essa regra de escalation do OpenCode nem codifique uma promoção temporária.

## Smoke test seguro

Use um diretório temporário com um arquivo simples e um teste determinístico. Não use
repo de produção, secrets ou rede. Confirme descoberta, TaskPacket, delegação,
execução do teste real, QA read-only e AuditReport compacto; remova o diretório
temporário depois.
