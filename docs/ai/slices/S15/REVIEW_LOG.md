# S15 — Review log

## Revisão de escopo

PASS. A neutralidade de modelos, skills e MCPs ficou exclusiva do Devin. Codex e
OpenCode constroem um mapa de capacidades para preferir ferramentas úteis, mas BMAD
continua obrigatório e seus routings permanecem definidos por runtime.

## Revisão de segurança e preservação

PASS. O instalador Devin escreve somente nos quinze nomes gerenciados em
`.agents/{skills,agents}` ou no root do usuário Devin. Não altera config, MCP,
credenciais ou política organizacional. Conflitos falham fechados; `--force` cria
backup recuperável.

## Revisão de contratos

PASS. Os quatro SKILL.md e onze agent Markdown passam frontmatter e contrato de
routing. Entry skills não fixam modelo. Workers usam aliases estáveis `swe` e
`opus`; nomes de marketing de Kimi, GLM, DeepSeek e MiMo não viram slugs inventados.

## Revisão de documentação

PASS. README raiz, catálogo, compatibilidade, README/cookbook da skill, adapter UI e
guias Codex/OpenCode/Devin foram atualizados. A afirmação antiga de que Devin não
possuía skills globais foi corrigida.

## Pendência externa

Executar na máquina de trabalho: `devin models list --format json`, `devin skills
list`, `devin mcp list`, instalação project dry-run/real e smoke seguro dos três
entry points. Essa pendência não autoriza instalação nesta máquina pessoal.
