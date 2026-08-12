# S17 — Especificação

1. `npx -y @mneresc/neres-agentic-bmad` abre um seletor textual quando o destino
   não é informado e aceita múltiplos destinos.
2. A forma não interativa continua compatível e aceita `claude-code`.
3. Claude Code recebe 3 entry agents, 11 subagentes e a skill de protocolo nos
   diretórios nativos `.claude/agents` e `.claude/skills`.
4. O pacote contém BMAD Method `6.11.0` já construído: `_bmad`, 49 skills e licença.
5. Se `_bmad/_config/manifest.yaml` existir no projeto, o instalador preserva a
   instalação. Se não existir, copia o bundle local sem rede ou subprocesso npm.
6. Conteúdo parcial de BMAD falha de forma segura, sem mistura silenciosa.
7. READMEs e guias principais existem em português, inglês e espanhol.
8. CI executa dependency review, auditoria npm, geração de SBOM, validação de
   integridade do vendor e publica os relatórios como artefatos.
9. O tarball exclui testes, fixtures, caches Python e documentação interna de IA.
