# Fluxo GitHub do NeresArmy

## Regra principal

Toda alteração destinada a `main` deve passar por Pull Request e pelo workflow
`CI`. Não há aprovação humana obrigatória nem revisão automática por agente nesta
fase.

## Fluxo de contribuição

1. Atualize `main`.
2. Crie uma branch curta, como `feat/nova-skill`, `fix/validador` ou
   `docs/cookbook`.
3. Faça commits focados e publique a branch.
4. Abra um Pull Request usando o template.
5. Aguarde os checks `quality` e `windows-compat`.
6. Resolva falhas e conversas abertas.
7. Faça squash merge manual quando todos os checks estiverem verdes.

## Checks obrigatórios

### `quality`

Executa em Ubuntu com Node.js 22 e Python 3.11:

- instalação reproduzível com `npm ci`;
- validação dos contratos das skills;
- testes Python e Node/Vitest;
- typecheck e build dos workspaces;
- verificação de que `docs/CATALOG.md` está atualizado;
- upload temporário dos bundles em `skills/*/dist/*`.

### `windows-compat`

Executa validação, testes Python e build em Windows para preservar a compatibilidade
documentada pelo repositório.

## Proteção da `main`

O ruleset deve:

- exigir Pull Request;
- exigir `quality` e `windows-compat`;
- exigir resolução das conversas;
- bloquear force-push e exclusão;
- exigir histórico linear;
- não exigir aprovação humana;
- permitir bypass administrativo somente para recuperação;
- não habilitar merge automático.

Não use a opção literal **Lock branch**, pois ela tornaria a branch somente leitura.
