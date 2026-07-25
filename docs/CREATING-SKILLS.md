# Criar uma skill no NeresArmy

1. Crie `skills/<slug>/`, usando somente letras minúsculas, números e hífens.
2. Adicione `SKILL.md` com `name` igual ao diretório e uma `description` clara.
3. Adicione `README.md` e `docs/COOKBOOK.md` com exemplos portáveis.
4. Adicione `catalog.json` com `category`, `status`, `invocation` e, quando houver,
   `npmPackage`.
5. Inclua `agents/openai.yaml` quando a skill precisar aparecer com metadados na
   interface do Codex.
6. Se houver runtime JavaScript, mantenha-o dentro da skill e publique-o como
   `@mneresc/<slug>` somente quando for uma decisão explícita.
7. Execute `npm run validate:skills`, `npm run generate:catalog` e os checks da
   própria skill antes de enviar a alteração.

A instalação da skill não depende de npm. O pacote npm é opcional e serve apenas
para fornecer um executável ou biblioteca.
