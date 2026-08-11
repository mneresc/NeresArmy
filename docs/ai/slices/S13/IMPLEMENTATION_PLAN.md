# Plano de implementação — S13

## Gate humano

O pedido atual autoriza explicitamente criar o agente no computador e publicá-lo no
NeresArmy após estabilização. A publicação deve ocorrer por branch e draft PR; merge
automático e npm publish continuam fora do escopo.

## Menor diff correto

1. Inicializar `neres-agentic-bmad` com o `init_skill.py` oficial, preservando o RED.
2. Implementar `scripts/opencode-bundle.mjs` e CLI de instalação/validação somente
   com Node standard library.
3. Criar os 13 agentes em `assets/opencode/agents` com IDs reais, `steps`, permissions
   e task allowlists.
4. Criar `assets/opencode/skills/agentic-bmad` com núcleo conciso e referências
   progressivas para contratos, planning, development, routing, security e logging.
5. Adicionar package metadata, README, cookbook, catálogo e metadados Codex.
6. Registrar a skill no README, compatibilidade, guia operacional e catálogo gerado.
7. Levar os testes RED a GREEN e rodar todos os gates do monorepo.
8. Executar dry-run e instalação global; validar resolved config com a CLI OpenCode.
9. Fazer smoke test seguro em diretório temporário e auditar permissões/diff.
10. Commitar fases focadas, publicar a branch e abrir draft PR; aguardar CI.

## Arquivos previstos

- `skills/neres-agentic-bmad/**`
- `README.md`
- `docs/CATALOG.md` (gerado)
- `docs/COMPATIBILITY.md`
- `docs/agentic-bmad.md`
- `docs/ai/slices/S13/**`

## Contratos e decisões

- OpenCode `1.18.15`, sintaxe v1 atual (`permission`, `steps`, `agent`).
- Instalação global oficial em `~/.config/opencode/agents` e
  `~/.config/opencode/skills`.
- O instalador não edita `opencode.jsonc`.
- Orquestração rotineira usa DeepSeek V4 Pro após o smoke test demonstrar custo e
  latência altos no GLM-5.2; architect/auditor mantêm GLM-5.2 e Kimi K3 é override
  excepcional porque o Task tool não troca model por tentativa.
- O nome canônico usa `dev-nerinhos-subagent-coder` e `...-mechanical`, conforme a
  lista final do pedido, removendo a duplicação textual intermediária.

## Validações

- RED original torna-se GREEN sem relaxar asserções.
- `quick_validate.py` da skill-creator.
- `npm run validate:skills`, catálogo sem drift, testes, typecheck, build e check.
- `opencode models`, `agent list`, `debug agent`, `debug skill` e resolved config.
- `git diff --check`, diff completo e status limpo após commit.

## Riscos e mitigação

- Conflito global: recusar por padrão; backup datado com `--force`.
- Contexto inflado: skill curta e referências carregadas condicionalmente.
- Modelo indisponível: validação obrigatória contra inventário antes de instalar.
- Reviewer com escrita: validação estrutural e resolved config real.
- Smoke test custoso: usar tarefa temporária mínima e modelos do routing definido.
