# S18.1 — Plano de implementação

## Estratégia

Aplicar o menor diff que transforma os testes RED em GREEN, preservando os onze
subagentes e reutilizando o protocolo, os instaladores e as políticas de backup
existentes.

## Ordem

1. Criar o contrato compartilhado de diagnóstico `bug-doctor.md` com
   `CapabilityMap`, reprodução, evidência, lente BMAD de edge cases, esquema
   `BugReport` e regras de roteamento.
2. Adicionar o profile Codex read-only `neres-bug-doctor` e registrá-lo no bundle
   com `gpt-5.6-terra`, esforço médio e aprovação on-request.
3. Adicionar ao OpenCode:
   - `neres-quick-dev`, restaurando o contrato já documentado;
   - `neres-bug-doctor` read-only, com delegação limitada a reader/test/QA;
   - modelos, allowlists e validações correspondentes.
4. Adicionar a entry skill Devin `neres-bug-doctor`, mantendo neutralidade de
   modelos, MCPs e skills e fallback equivalente quando BMAD não estiver disponível.
5. Adicionar o entry agent Claude Code read-only e atualizar o gerador para que o
   artefato seja reproduzível.
6. Atualizar validadores e contrato do tarball para exigir os novos artefatos.
7. Atualizar `SKILL.md`, READMEs, USAGE e COOKBOOK em PT/EN/ES com comandos,
   limites e handoff para o nosso `neres-quick-dev`.
8. Executar testes focados, build reprodutível do Claude, validação completa do
   pacote, `git diff --check` e revisão do diff.

## Arquivos prováveis

- `assets/{codex,opencode,devin,claude}/**`;
- `scripts/{codex,opencode,devin,claude}-bundle.mjs`;
- `scripts/build-claude-assets.mjs` e validadores do pacote;
- `tests/*-bundle.test.mjs` e `tests/distribution-contract.test.mjs`;
- `SKILL.md`, `README*.md`, `docs/USAGE*.md`, `docs/COOKBOOK*.md`;
- artefatos de processo em `docs/ai/slices/S18/`.

## Contratos e riscos

- contrato público novo: nome `neres-bug-doctor` e esquema `BugReport`;
- correção de contrato: `neres-quick-dev` passa a existir realmente no OpenCode;
- nenhum schema, migration, API de rede ou dependência nova;
- risco principal: divergência textual entre clientes; mitigação por referência
  compartilhada, gerador Claude e testes de paridade.

## Não objetivos

- implementar fixes automaticamente;
- mudar os onze subagentes ou publicar npm;
- alterar configurações-base, credenciais ou MCPs dos usuários;
- fazer commit, push ou merge sem autorização posterior específica.

## Validação

```text
node --test tests/*.test.mjs
node scripts/build-claude-assets.mjs
npm run check --workspace @mneresc/neres-agentic-bmad
git diff --check
```

## Gate humano

Implementação bloqueada até aprovação explícita deste plano.
