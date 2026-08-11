# Compatibilidade de agentes

## Neres Agentic BMAD

`neres-agentic-bmad` suporta Codex, OpenCode e Devin CLI/Desktop com assets
separados e contratos compactos compartilhados.

No Codex `0.146.1`, os três entry points são profiles em
`$CODEX_HOME/<nome>.config.toml`, enquanto os onze Nerinhos são custom agents TOML
em `$CODEX_HOME/agents`. O bundle usa `name`, `description`,
`developer_instructions`, `model`, `model_reasoning_effort` e `sandbox_mode`, e não
modifica o base `config.toml`. Profiles limitam concorrência a seis threads.

No OpenCode `1.18.15`, usa a sintaxe v1: agentes Markdown, `permission`, `steps`,
`mode`, `hidden`, `model`, skills sob demanda e `permission.task`. Requer OpenCode
`1.1.1` ou superior.

O bundle instala agentes em `~/.config/opencode/agents` e o protocolo em
`~/.config/opencode/skills/agentic-bmad`. Ele não modifica `opencode.jsonc`, não
reinstala BMAD e falha se os IDs `opencode-go` configurados não aparecerem em
`opencode models`.

No Devin, instala quatro skills em `.agents/skills` e onze custom subagents em
`.agents/agents` no modo projeto. O modo usuário usa o diretório global do Devin
CLI (`%APPDATA%\devin` no Windows). Os entry points são `neres-planner`,
`neres-developer` e `neres-quick-dev`; a skill de protocolo é
`neres-agentic-bmad`. Custom subagents ainda são uma capacidade experimental do
Devin CLI, portanto a validação final deve ocorrer na conta e versão da máquina de
trabalho.

O pacote Devin é neutro em relação a providers, MCPs e catálogos de skills. Ele
consulta `devin models list --format json`, usa aliases estáveis `swe` e `opus` nos
subagents e mantém os entry points sem pin de modelo. Kimi, GLM, DeepSeek, MiMo e
outros modelos só podem ser selecionados depois que seus IDs reais aparecerem no
inventário da conta. Promoções temporárias, inclusive disponibilidade gratuita até
uma data, não são codificadas como política durável.

BMAD `6.10.0` foi a versão usada no smoke test, mas a integração seleciona skills
BMAD pela descoberta real; nomes ausentes devem bloquear ou reduzir o fluxo, nunca
ser inventados. OpenCode V2 usa outro contrato (`agents`, `permissions`, `subagent`)
e ainda não é alvo deste bundle.

## Agent Skills portáteis

`ob-study-visual-mapper` é uma Agent Skill para Obsidian baseada no formato aberto:
`SKILL.md`, referências, assets e scripts locais. A criação dos Canvas depende apenas
da capacidade do agente de ler/escrever arquivos; os validadores opcionais requerem
Python 3 e não exigem que o Obsidian esteja aberto.

Instale por catálogo:

```powershell
npx skills@latest add mneresc/NeresArmy --skill ob-study-visual-mapper
```

JSON Canvas 1.0 permanece disponível em todos os clientes. Archify e o MCP
`sequential-thinking` são sugestões opcionais: a ausência deles não bloqueia a skill.
O MCP é útil para routing/ambiguidade complexos, mas não fornece fatos nem recebe o
vault automaticamente.

## Neres Study Refinery

`neres-study-refinery` segue a estrutura aberta de Agent Skills: uma pasta com
`SKILL.md`, recursos auxiliares e um executável local. O bundle requer Node.js
22.12 ou superior e não requer `npm install` no diretório instalado.

| Ambiente | Diretório suportado pelo instalador | Observação |
|---|---|---|
| Codex CLI/Desktop | `~/.agents/skills/neres-study-refinery` e `~/.codex/skills/neres-study-refinery` | O primeiro é o local oficial atual; o segundo é mantido para este ambiente funcional. |
| Clientes Agent Skills / OpenCode | `~/.agents/skills/neres-study-refinery` | Use também instalação por projeto quando o cliente exigir. |
| Devin CLI/Desktop | `<repo>/.agents/skills/neres-study-refinery` ou `%APPDATA%\devin\skills\neres-study-refinery` | Repositório é preferível para equipes; o CLI também suporta skills globais. |
| Antigravity | `~/.gemini/config/skills/neres-study-refinery` | Global oficial; por workspace use `.agents/skills`. |
| Claude Code | `~/.claude/skills/neres-study-refinery` | Claude Desktop pode exigir upload manual do pacote `.skill`. |
| Projeto portátil | `<projeto>/.agents/skills/neres-study-refinery` | Melhor denominador comum entre agentes compatíveis. |

Instalação em todos os diretórios globais conhecidos:

```powershell
npm run build
node scripts/install-skill.mjs --target all
```

O instalador falha se o destino já existir. Use `--force` somente quando quiser
substituir conscientemente uma instalação anterior.

O instalador geral do catálogo mantém `--target devin` como instalação por projeto.
Isso favorece versionamento e compartilhamento, embora o Devin CLI atual também
descubra skills globais no diretório do usuário.

## Execução pelo agente

O agente deve localizar a raiz da skill e executar:

```text
node <skill-root>/dist/neres-study-refinery.mjs --help
```

Antes de qualquer transformação real, execute `build ... --dry-run`.

## Limites de compatibilidade

- Interfaces que não descobrem skills por diretório precisam de upload ou
  importação manual do pacote `.skill`.
- O adaptador OpenAI continua desativado por padrão em todos os agentes.
- O Archify é uma instalação externa opcional e confiável; sua ausência não
  impede a V2 textual.
