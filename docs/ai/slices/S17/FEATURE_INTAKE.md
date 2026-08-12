# S17 — Intake

## Objetivo

Evoluir `@mneresc/neres-agentic-bmad` para uma distribuição autocontida que:

- suporte Claude Code além de Codex, OpenCode e Devin;
- ofereça seleção interativa de um ou vários destinos;
- instale BMAD estável quando ele não estiver presente no projeto;
- não clone repositórios nem baixe BMAD durante a instalação;
- mantenha documentação em português, inglês e espanhol;
- produza evidência automatizada de supply chain security.

## Restrições

- BMAD vendorizado deve ser versão fixa, MIT, com origem e integridade registradas.
- Nenhuma dependência runtime nova.
- Instalações existentes não podem ser sobrescritas silenciosamente.
- Configurações-base, credenciais e MCPs dos clientes permanecem fora de escopo.
- Nenhum merge automático.
