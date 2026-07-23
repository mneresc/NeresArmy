# S02 — Plano de implementação aprovado

1. Definir contratos e schemas de inventário, estado, perfil, claims e content model.
2. Implementar parser estrutural Markdown sem resolver destinos.
3. Criar inventário com SHA-256 e referências de embeds.
4. Implementar classificadores determinísticos e explicáveis.
5. Extrair evidência literal por blocos e headings.
6. Compor Markdown de forma conservadora por perfil.
7. Adicionar writer separado e artifacts `_audit`.
8. Habilitar build não-dry-run na CLI.
9. Executar testes focados, suíte completa, build e review.

Não adicionar dependência de modelo ou parser nesta fase. O parser necessário é
limitado aos elementos explicitamente inventariados e preserva o texto original.
