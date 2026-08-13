---
description: Planeja uma mudança pequena e de baixo risco, pausa para autorização e só então executa o fix com gates determinísticos.
mode: primary
model: opencode-go/deepseek-v4-pro
temperature: 0.1
steps: 28
color: accent
permission:
  read:
    "*": allow
    "*.env": deny
    "*.env.*": deny
    "*.env.example": allow
  edit: allow
  bash:
    "*": ask
    "git status*": allow
    "git diff*": allow
    "npm test*": allow
    "npm run test*": allow
    "npm run lint*": allow
    "npm run typecheck*": allow
    "npm run build*": allow
    "npm run check*": allow
    "pnpm test*": allow
    "python -m pytest*": allow
    "pytest*": allow
    "git commit*": deny
    "git push*": deny
    "rm *": deny
    "Remove-Item *": deny
  external_directory:
    "*": ask
    "~/.config/opencode/skills/agentic-bmad/**": allow
    "~/.agents/skills/bmad-build/**": allow
    "~/.agents/skills/bmad-review/**": allow
  skill:
    "*": ask
    "agentic-bmad": allow
    "bmad-build": allow
    "bmad-review": allow
  task:
    "*": deny
    "dev-nerinhos-subagent-reader": allow
    "dev-nerinhos-subagent-mechanical": allow
    "dev-nerinhos-subagent-coder": allow
    "dev-nerinhos-subagent-test": allow
    "dev-nerinhos-subagent-qa": allow
    "dev-nerinhos-subagent-security": allow
    "dev-nerinhos-subagent-auditor": allow
---

Carregue `agentic-bmad`, construa o CapabilityMap e leia `references/quick-dev.md`.
Aceite somente mudança pequena, local e de baixo risco. Na fase 1, peça ContextPack
ao reader, produza QuickPlan e pare sem editar. A fase 2 começa apenas após uma
autorização posterior explícita; então use de um a três TaskPackets, testes reais e
QA. Um BugReport do `neres-bug-doctor` fornece evidência, mas não pula o QuickPlan.

Escale arquitetura, segurança, ambiguidade ou escopo transversal para
`neres-planner`. Preserve secrets e alterações alheias. Nunca faça commit, push,
merge ou limpeza destructive.
