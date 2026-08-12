# Guia de uso — Neres Agentic BMAD

Este guia mostra como iniciar e operar o Neres Agentic em cada superfície
suportada: Codex CLI, Codex Desktop, OpenCode, Devin CLI e Devin Desktop. Para
instalação detalhada, routing e diagnóstico, consulte também o
[README](../README.md) e o [Cookbook](COOKBOOK.md).

## Instalação sem clonar o repositório

Faça primeiro um preview e depois a instalação:

```powershell
npx -y @mneresc/neres-agentic-bmad install codex --dry-run
npx -y @mneresc/neres-agentic-bmad install codex
```

```powershell
npx -y @mneresc/neres-agentic-bmad install opencode --dry-run
npx -y @mneresc/neres-agentic-bmad install opencode
```

```powershell
npx -y @mneresc/neres-agentic-bmad install devin --scope project --dry-run
npx -y @mneresc/neres-agentic-bmad install devin --scope project
```

O Devin também aceita `--scope user`. Se os destinos gerenciados já existirem, o
comando falha sem alterar nada; repita com `--force` somente depois de conferir o
preview. A atualização cria um backup recuperável.

## Escolha o entry point

| Entry point | Use quando | Resultado esperado |
| --- | --- | --- |
| `neres-planner` | O trabalho ainda precisa de entendimento, escopo ou plano | Artefato BMAD proporcional e TaskPackets executáveis |
| `neres-developer` | Story/spec e TaskPackets já estão prontos | Implementação, testes, QA e AuditReport |
| `neres-quick-dev` | Mudança pequena, local e de baixo risco | Primeiro QuickPlan; implementação somente após autorização posterior |

Não selecione os Nerinhos diretamente no uso normal. O entry point escolhe os
subagentes de leitura, escrita, arquitetura, implementação, teste, QA, segurança e
auditoria conforme o risco.

## Como formular o pedido

Um pedido útil contém objetivo, contexto, limites e aceite:

```text
Objetivo: adicionar validação de CPF no cadastro.
Contexto: o endpoint e os testes atuais estão em <arquivos ou módulo>.
Limites: não alterar o contrato público nem adicionar dependências.
Aceite: CPF inválido retorna o erro já padronizado e todos os testes passam.
```

Para planejamento, peça explicitamente TaskPackets. Para desenvolvimento, informe
qual story/spec e quais TaskPackets estão autorizados. Para quick-dev, lembre que a
primeira rodada deve terminar sem edição.

## Codex CLI

### Iniciar no modo interativo

```powershell
codex --profile neres-planner -C <repo>
codex --profile neres-developer -C <repo>
codex --profile neres-quick-dev -C <repo>
```

Exemplos de primeira mensagem:

```text
Planeje esta feature com BMAD proporcional ao risco. Gere TaskPackets, mas não implemente.
```

```text
Implemente os TaskPackets TP-01 e TP-02 da story aprovada. Rode os gates e entregue AuditReport.
```

```text
Diagnostique este bug pequeno e pare após o QuickPlan. Não edite nesta rodada.
```

### Uso não interativo

```powershell
codex --profile neres-planner -C <repo> exec "Planeje a mudança e gere TaskPackets; não implemente."
```

Use o modo não interativo somente quando o pedido e os limites já forem claros. O
planner é read-only; developer e quick-dev usam workspace-write com aprovações sob
demanda.

### Skills e MCPs no Codex

BMAD continua sendo o workflow obrigatório. O agente pode preferir skills e MCPs
saudáveis para filesystem, testes, E2E, documentação ou review, mas eles apoiam a
fase BMAD selecionada e não a substituem.

## Codex Desktop

1. Abra a pasta do repositório como projeto no Codex Desktop.
2. Inicie uma task e invoque a skill pelo nome `$neres-agentic-bmad`.
3. Declare qual papel deseja: planner, developer ou quick-dev.
4. Revise pedidos de permissão antes de autorizar escrita ou acesso externo.

Exemplos:

```text
Use $neres-agentic-bmad como neres-planner. Planeje esta feature com BMAD proporcional, gere TaskPackets e não implemente.
```

```text
Use $neres-agentic-bmad como neres-developer. Consuma a story e os TaskPackets anexos, implemente somente o escopo permitido e entregue AuditReport.
```

```text
Use $neres-agentic-bmad como neres-quick-dev. Faça apenas o diagnóstico e o QuickPlan nesta rodada.
```

Os profiles `neres-*` são entry points nativos da CLI. Na interface Desktop, use a
skill explicitamente como acima; não presuma que um profile CLI foi selecionado
pela interface.

## OpenCode TUI

O OpenCode possui dois entry points: `neres-planner` e `neres-developer`.

```powershell
opencode --agent neres-planner <repo>
opencode --agent neres-developer <repo>
```

Também é possível abrir o TUI normalmente e escolher o agente no seletor da
interface. Para trabalho pequeno, use o planner com o workflow BMAD mínimo e depois
entregue o TaskPacket ao developer; o bundle OpenCode não possui um entry point
`neres-quick-dev` separado.

### OpenCode não interativo

```powershell
opencode run --agent neres-planner --dir <repo> "Planeje a correção e gere TaskPackets; não implemente."
```

```powershell
opencode run --agent neres-developer --dir <repo> "Implemente o TaskPacket aprovado e entregue AuditReport."
```

### Skills e MCPs no OpenCode

O agente carrega `agentic-bmad` e mantém BMAD como source of truth. Skills e MCPs
adicionais podem apoiar testes, filesystem, E2E ou revisão. Uma capability
desconhecida exige aprovação e não recebe permissão de escrita automaticamente.

## Devin CLI

No Devin, os entry points são skills invocadas por slash command:

```text
/neres-planner Planeje esta feature, gere TaskPackets e não implemente.
/neres-developer Implemente os TaskPackets aprovados e entregue AuditReport.
/neres-quick-dev Diagnostique este bug e pare após o QuickPlan.
```

Abra o CLI dentro do repositório de trabalho:

```powershell
cd <repo>
devin
```

Para automação não interativa, depois de validar a skill no ambiente corporativo:

```powershell
devin -p --respect-workspace-trust false "/neres-planner Planeje a mudança e gere TaskPackets; não implemente."
```

Antes do primeiro uso, confirme o inventário real:

```powershell
devin models list --format json
devin skills list
devin mcp list
```

### Neutralidade no Devin

Somente o bundle Devin é neutro em relação a modelos, skills e MCPs:

- o entry point preserva o modelo selecionado pelo usuário ou pelo Adaptive Devin;
- os subagentes usam os aliases estáveis `swe` e `opus`;
- Kimi, GLM, DeepSeek, MiMo, Claude ou versões SWE específicas só entram quando o
  inventário atual da conta confirmar o identificador aceito;
- BMAD é usado quando disponível; sem BMAD, uma skill equivalente pode assumir a
  fase que cobrir integralmente;
- MCPs saudáveis e autoritativos são preferidos, mas instalação, autenticação e
  ampliação de permissões continuam dependendo de autorização.

## Devin Desktop

O bundle é voltado ao Devin Desktop que disponibiliza o Devin CLI local. Abra o
repositório no Desktop e confirme que o CLI integrado encontra as skills:

```powershell
devin skills list
```

Se a conversa do Desktop expuser slash commands, use `/neres-planner`,
`/neres-developer` ou `/neres-quick-dev` diretamente. Se a interface não listar as
skills, use o terminal com o CLI incluído no Desktop; não copie manualmente o
protocolo para o prompt.

O Devin CLI e o Devin cloud são produtos distintos. Este bundle não promete acesso
a Playbooks, Knowledge ou Secrets da conta cloud e não altera controles da
organização.

## Fluxo recomendado de ponta a ponta

```text
pedido
  -> neres-planner
  -> artefato BMAD ou equivalente permitido no Devin
  -> TaskPackets ready-for-development
  -> neres-developer
  -> implementação e gates determinísticos
  -> QA e security quando acionada por risco
  -> AuditReport PASS ou REWORK
```

Para uma mudança pequena com quick-dev:

```text
pedido pequeno -> QuickPlan sem edição -> autorização humana -> implementação -> testes -> QA
```

## Checklist de saída

Considere uma execução concluída apenas quando:

- o diff respeita os arquivos autorizados;
- testes, lint, typecheck e build aplicáveis foram realmente executados;
- falhas e comandos decisivos aparecem no TestReport;
- QA foi executada em mudanças não triviais;
- security foi executada quando houver auth, secrets, dados sensíveis, permissões,
  dependências, execução de comandos ou fronteira multi-tenant;
- o AuditReport termina em `PASS` ou explica objetivamente o `REWORK`;
- nenhum commit, push, merge, deploy ou ampliação de escopo ocorreu sem autorização.

## Diagnóstico rápido

| Sintoma | Verificação |
| --- | --- |
| Profile Codex não inicia | `codex doctor --json` e presença do profile em `$CODEX_HOME` |
| Agente OpenCode não aparece | `opencode agent list` e `opencode debug agent <nome>` |
| Skill OpenCode não aparece | `opencode debug skill` |
| Skill Devin não aparece | `devin skills list` e instalação em `.agents/skills` ou `%APPDATA%\devin\skills` |
| Subagente Devin não aparece | Confirme `.agents/agents` ou `%APPDATA%\devin\agents` e a versão do CLI |
| Modelo indisponível | Consulte o comando de modelos do runtime; não invente um ID |
| Duas tentativas falharam | Pare e retorne `NEEDS_ESCALATION` com a evidência decisiva |

Para procedimentos de reinstalação, backup, conflitos e smoke tests, continue no
[Cookbook](COOKBOOK.md).

## Referências oficiais do Devin

- [Devin CLI Quickstart](https://docs.devin.ai/cli)
- [Commands and flags](https://docs.devin.ai/cli/reference/commands)
- [Skills overview](https://docs.devin.ai/cli/extensibility/skills/overview)
- [Subagents](https://docs.devin.ai/cli/subagents)
