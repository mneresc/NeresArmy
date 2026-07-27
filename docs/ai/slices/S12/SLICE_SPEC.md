# S12 — Obsidian Study Visual Mapper

## Objetivo

Publicar uma Agent Skill instalável que converta material Markdown autorizado em
mapas visuais de estudo e recall para Obsidian, com JSON Canvas válido,
rastreabilidade e validação determinística.

## Inclui

- Skill canônica, metadados Codex, README, cookbook e catálogo.
- Referências progressivas para pipeline semântico, ontologia, routing, IR, Canvas,
  recall, Archify, sequential-thinking e exemplos.
- Gerador determinístico de IDs, Canvas base, recall e atualização de posições.
- Validadores de Canvas e manifest com saída humana e JSON.
- Schemas e templates de estudo/recall.
- Testes para os 20 casos determinísticos solicitados.

## Não inclui

- Parser semântico/LLM próprio, plugin Obsidian, executável npm, cloud, telemetria,
  OCR, pesquisa externa ou implementação do Archify/sequential-thinking.
- Garantia de que toda relação inferida por um modelo esteja correta; a skill exige
  evidência e sinalização de incerteza.

## Comportamento esperado

1. Inspecionar apenas o escopo autorizado e extrair proposições atômicas.
2. Escolher o tipo visual com mapa conceitual como padrão.
3. Produzir IR neutra com source references antes de renderizar.
4. Gerar Canvas com IDs estáveis, relações nomeadas e layout sem sobreposição.
5. Criar recall por ocultação relacional determinística, mantendo respostas no
   mapa de estudo.
6. Usar Archify somente quando disponível e melhor para fluxo técnico; sempre
   manter Canvas como índice/fallback.
7. Sugerir sequential-thinking para routing/ambiguidade complexos quando disponível,
   sem torná-lo requisito.
8. Atualizar Canvas preservando IDs/posições inalterados e conteúdo manual.
9. Validar Canvas, manifest e cobertura antes da entrega.

## Critérios de aceite

1. `name` e pasta são `ob-study-visual-mapper`; a documentação declara claramente
   que é uma Agent Skill para Obsidian.
2. `SKILL.md` possui frontmatter válido, menos de 500 linhas e progressive disclosure.
3. JSON Canvas continua disponível sem Archify ou sequential-thinking.
4. O validador detecta JSON inválido, IDs duplicados, tipos/campos inválidos,
   geometria, cores, referências, lados/endpoints, paths, grupos, sobreposição,
   densidade, edges sem label e proveniência ausente.
5. Erros retornam status não zero e a saída JSON é estável.
6. IDs, paths, routing, render, recall e update são determinísticos.
7. Os 20 cenários do plano RED passam em Windows e Linux sem dependências.
8. `quick_validate.py`, `npm run validate:skills`, `npm test`, `npm run typecheck`,
   `npm run build` e `npm run check` passam.
9. README, catálogo e matriz de compatibilidade registram a skill.
10. A branch é publicada e um PR é aberto; nenhum merge ou npm publish ocorre.

## Aprovação humana

Autorização registrada no pedido de 2026-07-27: “Crie e publique essa skill ... chame
de ob-study-visual-mapper”.
