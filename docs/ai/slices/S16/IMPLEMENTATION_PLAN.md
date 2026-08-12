# S16 — Plano técnico

1. Criar teste RED para o binário e o manifest publicável.
2. Adicionar `scripts/neres-agentic.mjs` como dispatcher sem shell.
3. Tornar o workspace publicável, declarar bin/files/engines/repository/license.
4. Incluir assets e scripts necessários no tarball.
5. Atualizar README, guia de uso, cookbook e catálogo de comandos.
6. Rodar testes, validar o tarball, instalar a partir do `.tgz` em temporários e
   executar o gate completo.
7. Publicar npm somente após `npm publish --dry-run` e confirmação dos gates.

O pedido explícito para criar a instalação via npx é a aprovação humana deste plano
limitado. Não há dependência nova nem mudança no contrato dos bundles instalados.
