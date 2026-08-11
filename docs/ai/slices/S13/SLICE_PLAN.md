# Plano de slices — S13

## Slice único de release

Esta entrega é tratada como um slice coeso porque o valor observável só existe quando
o bundle, o instalador e a descoberta real pelo OpenCode funcionam juntos. Dividir a
publicação deixaria configurações parcialmente instaláveis no catálogo público.

## Resultado observável

Após executar o instalador, o OpenCode lista somente `neres-planner` e
`neres-developer` como novos agentes primários, descobre os onze subagentes internos,
carrega `agentic-bmad` sob demanda e resolve todos os modelos e permissões sem erro.

## Ordem interna

1. Contratos e testes determinísticos do bundle.
2. Skill compartilhada e agentes Markdown.
3. Instalador/validador e backup.
4. Documentação e catálogo.
5. Instalação global e smoke test real.
6. Gates completos, auditoria e Pull Request.
