# S15 — GREEN report

## Resultado

GREEN para o bundle versionado e para a sincronização Codex/OpenCode. O smoke real
do Devin permanece deliberadamente pendente para a máquina corporativa autenticada.

## Evidências

- `npm run check`: exit 0 fora do sandbox; validação do catálogo, testes Python,
  testes de scripts e workspaces completos.
- `@mneresc/neres-agentic-bmad check`: 15/15 testes; validadores de fixture para
  13 agentes OpenCode, 3 profiles + 11 agentes Codex e 4 skills + 11 agentes Devin.
- Validação ao vivo: Codex `0.146.1` e OpenCode `1.18.15` aceitaram os respectivos
  bundles.
- Devin dry-run: 15 destinos, zero escrita, usando inventário fixture.
- Instaladores testados para preservação de config/MCP/unrelated files e backup em
  conflito com `--force`.
- `git diff --check`: exit 0.

## Pós-instalação local

- Codex sincronizado com backup em
  `C:\Users\marce\.codex\backups\neres-agentic-bmad-codex-20260811T104852617Z`.
- OpenCode sincronizado com backup em
  `C:\Users\marce\.config\opencode\backups\neres-agentic-bmad-20260811T104907253Z`.
- `codex doctor --json`: instalação, MCP e rede OK; warning somente em três agents
  preexistentes e não gerenciados (`file-reader`, `lint-checker`, `test-runner`).
- `opencode agent list`: os 13 agentes Neres foram descobertos.

## Limite ambiental

O executável Devin não existe nesta máquina pessoal. Não foi instalado, autenticado
ou simulado. A aceitação final no trabalho deve usar o inventário real de modelos,
skills e MCPs e executar smoke dos três entry points.
