# Cookbook — Neres Agentic BMAD

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

## Preview e destino de teste

```powershell
node scripts/install-opencode.mjs --dry-run
node scripts/install-opencode.mjs --config-dir .tmp/opencode
```

## Atualizar uma instalação existente

Primeiro rode dry-run e inspecione os arquivos atuais. Depois:

```powershell
node scripts/install-opencode.mjs --force
```

O resultado informa `backupDirectory`. Sem `--force`, qualquer destino existente
interrompe a instalação antes de escrita.

## Model não disponível

Execute `opencode models` e compare os IDs completos. O validador falha fechado. Para
trocar um modelo, edite o asset do agente no pacote, atualize a documentação/fixture e
rode todos os testes; não use um nome de marketing sem provider/model-id real.

## Agente não aparece

1. Execute `opencode debug paths` e confirme o config root.
2. Execute `opencode agent list`.
3. Execute `opencode debug agent <nome>`.
4. Confirme extensão `.md`, frontmatter e `mode`.
5. Reinstale apenas após dry-run; não edite o JSON global para compensar sintaxe
   inválida.

## Skill não aparece

Execute `opencode debug skill` e confirme
`~/.config/opencode/skills/agentic-bmad/SKILL.md`. Verifique se o agente permite a
skill `agentic-bmad`.

## Escalation

Após duas tentativas sem sucesso, teste persistente sem causa, mudança fora de
`allowed_files`, requisito contraditório ou novo risco crítico, pare o worker. Retorne
`NEEDS_ESCALATION`; architect/auditor GLM-5.2 ou override explícito redefine o gap.
Kimi K3 exige override explícito de sessão e não é default de worker.

## Smoke test seguro

Use um diretório temporário com um arquivo simples e um teste determinístico. Não use
repo de produção, secrets ou rede. Confirme descoberta, TaskPacket, delegação,
execução do teste real, QA read-only e AuditReport compacto; remova o diretório
temporário depois.
