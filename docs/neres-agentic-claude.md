# Neres Agentic BMAD no Claude Code

O pacote instala uma equipe multiagente nativa para Claude Code sem clonar outro
repositório. O tarball npm já contém os agentes, o protocolo compartilhado, o core
BMAD Method 6.11.0 e 49 skills BMAD construídas.

Documentação geral: [português](../skills/neres-agentic-bmad/README.md),
[English](../skills/neres-agentic-bmad/README.en.md) e
[español](../skills/neres-agentic-bmad/README.es.md).

## Instalação

Abra o seletor interativo:

```powershell
npx -y @mneresc/neres-agentic-bmad
```

Ou instale diretamente no projeto atual:

```powershell
npx -y @mneresc/neres-agentic-bmad install claude-code --scope project --dry-run
npx -y @mneresc/neres-agentic-bmad install claude-code --scope project --language pt
```

Use `--scope user` para instalar em `~/.claude`. O modo projeto cria
`.claude/agents`, `.claude/skills` e `_bmad` no repositório atual. Nenhum clone,
download do BMAD ou script remoto é executado durante a instalação.

## Uso

```powershell
claude --agent neres-planner
claude --agent neres-developer
claude --agent neres-quick-dev
```

- `neres-planner`: planeja mudanças relevantes e usa as skills BMAD adequadas.
- `neres-developer`: implementa um plano aprovado e coordena especialistas.
- `neres-quick-dev`: trata mudanças pequenas com validação proporcional.

Os entry agents podem chamar somente os especialistas declarados em suas
allowlists. Especialistas não podem criar outra camada de subagentes.

## Modelos, skills e MCPs

Os assets usam os nomes nativos `inherit`, `opus`, `sonnet` e `haiku`. A escolha
final depende dos modelos disponíveis na conta e das políticas do ambiente de
trabalho. Skills e MCPs já configurados no Claude Code permanecem disponíveis;
o instalador não modifica `.mcp.json` nem `settings.json`.

## BMAD existente

- instalação completa no mesmo cliente: preservada;
- core 6.11.0 existente e novo cliente sem skills: as 49 skills são adicionadas;
- instalação parcial ou core de outra versão sem skills compatíveis: a operação
  falha antes de escrever os assets Neres.

Use `--skip-bmad` apenas quando a organização gerenciar o BMAD separadamente.

## Verificação rápida

Depois da instalação por projeto, confirme a existência de:

```text
.claude/agents/neres-planner.md
.claude/agents/neres-developer.md
.claude/agents/neres-quick-dev.md
.claude/skills/neres-agentic-bmad/SKILL.md
.claude/skills/bmad-help/SKILL.md
_bmad/_config/manifest.yaml
```

Antes de atualizar uma instalação, rode `--dry-run`. Use `--force` somente para
substituir destinos gerenciados pelo Neres; o instalador cria backup e não
sobrescreve o BMAD existente.
