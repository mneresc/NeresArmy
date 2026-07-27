# BDD — S12

## Cenário 1 — Geração para Obsidian

**Given** Markdown autorizado com conceitos, regras, qualificadores e fontes  
**When** a Agent Skill gera um mapa de estudo  
**Then** entrega JSON Canvas válido com relações nomeadas, IDs estáveis e manifest
que rastreia fatos até a origem.

## Cenário 2 — Recall sem vazamento

**Given** um mapa de estudo validado  
**When** o modo recall é solicitado  
**Then** relações de alto valor são ocultadas deterministicamente, âncoras continuam
visíveis e a resposta completa permanece apenas no mapa de estudo.

## Cenário 3 — Routing e integrações opcionais

**Given** material conceitual ou processual  
**When** o tipo visual é escolhido  
**Then** mapa conceitual é o padrão, Archify só é recomendado para topologias
compatíveis e a ausência de Archify/sequential-thinking resulta em Canvas utilizável.

## Cenário 4 — Atualização segura

**Given** Canvas e manifest gerados anteriormente com posições manuais preserváveis  
**When** a mesma identidade semântica reaparece na atualização  
**Then** IDs e posições inalterados são mantidos, novos elementos são posicionados
próximos e conteúdo manual não é removido sem proveniência.

## Cenário 5 — Falhas estruturais

**Given** Canvas com JSON inválido, IDs duplicados, edge pendente, tipo/campo/lado/cor
inválidos, sobreposição ou metadata top-level não suportada  
**When** o validador é executado  
**Then** ele relata diagnósticos classificados e retorna status não zero.

## Cenário 6 — Portabilidade e privacidade

**Given** caminhos de vault em Windows ou POSIX  
**When** a skill normaliza referências e gera artefatos  
**Then** usa paths relativos com `/`, não sai do diretório selecionado, não acessa
URLs e não persiste conteúdo fora do destino autorizado.

## Rastreabilidade

- Critérios 1–3: cenários 1 e 3.
- Critérios 4–7: cenários 1–6 e testes determinísticos.
- Critérios 8–10: validação de repositório e fluxo de publicação.

