# S17 — Plano técnico aprovado

1. Criar testes públicos e obter RED real.
2. Vendorizar a saída oficial de `bmad-method@6.11.0` sem caches, com licença e
   checksums, usando uma única cópia canônica das 49 skills.
3. Implementar instalador BMAD local idempotente, sem rede.
4. Criar bundle Claude Code com frontmatter nativo e least privilege.
5. Evoluir o dispatcher para modo interativo e múltiplos destinos.
6. Traduzir README, Usage, Cookbook e Security para PT/EN/ES.
7. Adicionar relatório determinístico, SBOM e dependency review no CI.
8. Rodar gates por pacote, tarball real, instalação pública temporária e monorepo.
9. Publicar uma nova versão npm somente após todos os gates e atualizar o PR.

O pedido explícito do usuário aprova este plano. A versão já publicada `0.1.0`
permanece imutável; a nova entrega usará uma versão posterior.
