# Compatibilidade de agentes

`neres-study-refinery` segue a estrutura aberta de Agent Skills: uma pasta com
`SKILL.md`, recursos auxiliares e um executável local. O bundle requer Node.js
22.12 ou superior e não requer `npm install` no diretório instalado.

| Ambiente | Diretório suportado pelo instalador | Observação |
|---|---|---|
| Codex CLI/Desktop | `~/.codex/skills/neres-study-refinery` | Destino funcional deste ambiente. |
| Clientes Agent Skills / OpenCode / Devin | `~/.agents/skills/neres-study-refinery` | Use também instalação por projeto quando o cliente exigir. |
| Antigravity | `~/.gemini/antigravity/skills/neres-study-refinery` | Pode ser copiado para o workspace conforme a política do cliente. |
| Claude Code | `~/.claude/skills/neres-study-refinery` | Claude Desktop pode exigir upload manual do pacote `.skill`. |
| Projeto portátil | `<projeto>/.agents/skills/neres-study-refinery` | Melhor denominador comum entre agentes compatíveis. |

Instalação em todos os diretórios globais conhecidos:

```powershell
npm run build
node scripts/install-skill.mjs --target all
```

O instalador falha se o destino já existir. Use `--force` somente quando quiser
substituir conscientemente uma instalação anterior.

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

