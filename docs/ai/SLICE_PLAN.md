# Neres Study Refinery — Slice Plan

## Estratégia

Entregar primeiro o boundary de segurança e a CLI observável. Só depois permitir
transformação semântica, imagens ou diagramas. Cada slice termina com comportamento
público demonstrável e um commit próprio.

## S01 — Escopo seguro e dry-run

**Resultado observável:** executar `build --dry-run` para uma nota ou pasta e receber
um plano determinístico com entradas, exclusões e saída, sem qualquer escrita.

Inclui:

- workspace inicial da skill/pacote;
- configuração default e merge CLI;
- canonicalização de vault/input/output no Windows;
- nota e pasta com subpastas;
- exclusões padrão;
- rejeição de escape de escopo e colisão com original;
- resumo dry-run em texto e JSON;
- contrato inicial de erros e códigos de saída.

Reduz primeiro o maior risco: ler/escrever fora do escopo autorizado.

## S02 — Inventário documental rastreável

**Resultado observável:** gerar inventário validado de Markdown e imagens autorizadas.

Inclui:

- hashes, tamanho, headings, links, embeds, tabelas, fórmulas, código e callouts;
- resolução de imagens incorporadas;
- imagens didáticas da pasta e classificação `unknown` inicial;
- motivos de exclusão;
- ordem determinística;
- TypeScript + JSON Schema para `SourceInventory`.

Depende de S01.

## S03 — Estado, perfil e ledger de evidências

**Resultado observável:** produzir `SourceState`, `DomainProfile` e `ContentModel`
validados, sem ainda gerar a V2 final.

Inclui:

- `raw` versus `structured`;
- perfis `law-afo`, `mathematics`, `technical-it`, `hybrid`, `generic`;
- override manual;
- claims e estados `supported`, `ambiguous`, `conflicting`, `missing`, `illegible`;
- rastreabilidade por source/excerpt/region;
- portas `TransformationModel` e `VisualContentExtractor`;
- adapter fake determinístico para testes.

Depende de S02.

## S04 — Composição textual por perfil

**Resultado observável:** gerar uma V2 textual separada por nota com frontmatter,
seções não vazias e tabela de rastreabilidade.

Inclui:

- templates Direito/AFO, Matemática, TI, híbrido, generic;
- preservação de notas já estruturadas;
- formato adequado por unidade;
- compressão conservative/balanced/aggressive;
- overview de pasta;
- escrita atômica em saída separada.

Depende de S03.

## S05 — Gates determinísticos anti-alucinação

**Resultado observável:** aceitar uma V2 suportada e reprovar alterações factuais
especificadas.

Inclui:

- claim IDs;
- números;
- entidades;
- modalidade normativa;
- fórmulas;
- código;
- fonte externa;
- overwrite/original-as-output;
- idempotência semântica;
- lacunas, conflitos e incertezas.

Depende de S04.

## S06 — Pipeline multimodal

**Resultado observável:** processar fixtures de screenshot textual, tabela, fórmula,
diagrama e imagem parcialmente ilegível via contrato multimodal.

Inclui:

- classificação visual;
- extração estruturada e confidence;
- OCR opcional apenas como fallback textual;
- adapter de agente;
- adapter de produção condicionado à decisão de provider e privacidade;
- cache local baseado em hash, nunca usado como fonte autônoma;
- reconstrução Markdown com marcação de incerteza.

Depende de S03 e integra com S04/S05.

## S07 — Diagramas Archify

**Resultado observável:** um candidato com score suficiente produz IR validado, HTML
e SVG incorporável; topologia alterada é rejeitada.

Inclui:

- score de candidato;
- mapeamento workflow/sequence/lifecycle/dataflow/architecture;
- `DiagramProvider`;
- adapter para `tt-a1i/archify`;
- diagnóstico de instalação;
- validação pré e pós-render de nós, relações, direção, labels e agrupamentos;
- falha fechada e leitura linear de fallback.

Depende de S03, S05 e S06 para diagramas provenientes de imagem.

## S08 — Relatório, CLI completa e compatibilidade de agentes

**Resultado observável:** execução ponta a ponta produz V2, assets, overview e relatório,
ou falha sem estado parcial.

Inclui:

- relatório de transformação completo;
- todos os argumentos CLI especificados;
- logs sem conteúdo sensível;
- `SKILL.md`, `agents/openai.yaml`, prompts, schemas, configs e templates;
- instruções para Codex, Claude Code e OpenCode;
- instalação/diagnóstico;
- build, typecheck, lint e testes de integração.

Depende de S01–S07.

## S09 — Distribuição NeresArmy

**Resultado observável:** skill instalada localmente e monorepo remoto verificável.

Inclui:

- layout `skills/neres-study-refinery`;
- README do repositório agregador;
- licença conforme decisão;
- commits pequenos preservando as fases;
- instalação em `~/.codex/skills/neres-study-refinery`;
- validação da instalação;
- criação e publicação em `mneresc/NeresArmy`;
- publicação npm somente se autorizada.

Depende de S08 e das decisões de publicação.

## Mapeamento para as fases solicitadas

| Fase da especificação | Slices |
|---|---|
| Fase 1 | S01 |
| Fase 2 | S02–S04 |
| Fase 3 | S06 |
| Fase 4 | S07 |
| Fase 5 | S05, S08–S09 |

S05 é antecipado antes das integrações de maior risco para que imagens e diagramas
nunca avancem sem gates.

## Cobertura dos 30 casos mínimos

- S01: 1, 6, 24–29.
- S02: 6–7, 23–24, 26–28.
- S03: 1–2, 7, 13–16.
- S04: 1–6, 13–16, 28.
- S05: 17–22, 25, 30.
- S06: 7–12.
- S07: 11, 21–22.
- S08: cobertura end-to-end de 1–30.

## Decisões pendentes

- Visibilidade/licença do repositório: bloqueia apenas S09.
- Provider e política de privacidade: bloqueiam o adapter de produção de S06, não os
  contratos nem o adapter fake/agente.
- Publicação npm: bloqueia apenas a ação externa opcional em S09.
- Estratégia de Archify: a proposta padrão é adapter externo configurável, sem vendoring.

## Recomendação

Iniciar por S01. É o menor slice útil, define o contrato público da CLI e prova que a
ferramenta não lê nem escreve fora do escopo antes de introduzir modelos ou imagens.

## Próximo passo

Detalhar S01 com `pm-spec`, seguido de BDD, plano RED, testes RED e plano técnico.
