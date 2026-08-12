# S16 — Instalação do Neres Agentic via npx

## Objetivo

Eliminar a necessidade de clonar o NeresArmy e localizar scripts manualmente. O
usuário deve conseguir instalar o bundle completo para Codex, OpenCode ou Devin com
um comando `npx`, preservando validação, dry-run, conflitos e backups.

## Escopo

- Publicar `@mneresc/neres-agentic-bmad` como pacote npm executável.
- Expor o binário `neres-agentic`.
- Despachar para os instaladores existentes sem duplicar a lógica de instalação.
- Suportar Codex, OpenCode e Devin project/user.
- Documentar instalação, atualização consciente e diagnóstico.
- Validar o conteúdo exato do tarball antes da publicação.

## Não escopo

- Instalar ou atualizar Codex, OpenCode, Devin ou BMAD.
- Alterar configurações base, MCPs, credenciais ou políticas organizacionais.
- Publicar plugins nativos Codex/OpenCode/Devin neste slice.
- Fazer merge automático.

## Restrição pública

O pacote não pode depender do checkout do monorepo. Assets e scripts necessários
devem estar dentro do tarball publicado e funcionar em Windows, macOS e Linux.
