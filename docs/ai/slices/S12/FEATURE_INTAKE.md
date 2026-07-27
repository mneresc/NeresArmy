# Intake — Obsidian Study Visual Mapper

## Objetivo

Adicionar ao catálogo público NeresArmy a Agent Skill `ob-study-visual-mapper`.
Ela deve transformar Markdown autorizado de um vault Obsidian em mapas de estudo e
recall no formato JSON Canvas, com relações nomeadas, rastreabilidade, atualização
segura e fallback local.

## Usuário e resultado observável

- Pessoa que estuda em um vault Obsidian, especialmente para concursos.
- Agente compatível com Agent Skills que lê uma nota, seção, pasta ou Canvas
  existente.
- Resultado: `.canvas` válido, manifest de proveniência e relatório sucinto de
  cobertura; opcionalmente um artefato Archify quando a topologia justificar.

## Escopo

- Agent Skill portátil e explicitamente documentada como skill para Obsidian.
- JSON Canvas 1.0 como saída primária e fallback obrigatório.
- Mapas conceituais, classificação, processo, lifecycle, comparação, timeline,
  competência, exceções, dependência de fórmulas e arquitetura.
- Modos `study`, `recall`, `both` e `update`.
- IDs semânticos determinísticos, layout inicial legível e preservação segura de
  posições já existentes.
- Validação local de Canvas e manifest, sem exigir Obsidian aberto.
- Archify e MCP `sequential-thinking` apenas como integrações opcionais sugeridas.
- Documentação, cookbook, exemplos sintéticos e registro no catálogo.

## Não escopo

- Plugin do Obsidian, aplicação de desenho, banco de grafos, busca vetorial,
  scheduler, flashcards, OCR, pesquisa web autônoma ou gerador Mermaid.
- Upload automático de notas, telemetria, analytics, armazenamento remoto ou
  publicação npm.
- Vendoring ou clonagem do Archify.

## Restrições e contratos

- Tratar somente o conteúdo autorizado do vault como fonte factual.
- Não sobrescrever fontes nem seguir links externos automaticamente.
- Preservar números, modalidade, negação, exceções, escopo, prazos, fórmulas e
  topologia.
- Manter compatibilidade Windows e caminhos relativos com barras `/` no Canvas.
- Contratos públicos novos: `SKILL.md`, JSON Canvas 1.0, manifest
  `visual-map-manifest/v1` e CLIs Python de validação.
- Não adicionar dependência de runtime.

## Riscos

1. Inferência sem evidência: exigir source reference e registrar ambiguidades.
2. Canvas ilegível: validar sobreposição/densidade e dividir tópicos densos.
3. Atualização destrutiva: remover apenas elementos com proveniência gerada.
4. Integração ausente: Archify e sequential-thinking nunca podem bloquear o Canvas.
5. Privacidade: manter processamento local-first e não registrar conteúdo de vault.

## Decisões

- Nome canônico solicitado: `ob-study-visual-mapper`.
- Categoria: `study`; estado inicial: `experimental`; invocação: `model`.
- Runtime determinístico: Python 3 standard library, seguindo o runner já existente.
- Publicação: branch e Pull Request, conforme `docs/GITHUB-WORKFLOW.md`; sem merge
  automático.
