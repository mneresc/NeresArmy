# S05 — Entrega auditável e distribuição multiagente

## Objetivo

Fechar o compilador com validação de grounding, números, entidades, modalidade
normativa, fórmulas e código; produzir frontmatter, visão geral e relatório;
aceitar configuração validada; e gerar um artefato executável instalável.

## Em escopo

- `claimId` visível para todo claim suportado incluído na V2.
- Comparadores conservadores para números, entidades, modalidade, fórmulas e
  blocos de código.
- Falha antes da escrita da nota quando a validação final divergir.
- Escrita atômica dos artefatos textuais.
- Frontmatter determinístico com fontes e status.
- `_Visão Geral.md` para transformação de pasta, em ordem natural.
- `_audit/<nome>-transformation-report.md`.
- Configuração YAML parcial, estrita e validada.
- CLI executável empacotada sem publicação no npm.
- Instalador para diretórios de skills usados por Codex, agentes compatíveis
  com Agent Skills, Antigravity e Claude Code.

## Fora de escopo

- Publicação no npm.
- Envio automático do vault para qualquer serviço.
- Alteração ou incorporação do código do Archify.
- Garantia de instalação automática em produtos desktop que só aceitem upload
  manual de uma skill empacotada.

## Critérios de aceitação

1. Uma mutação de número, modalidade, fórmula ou código é detectada.
2. Um claim sem evidência ou sem marcador falha no grounding.
3. A V2 contém frontmatter, marcadores de claim e tabela de rastreabilidade.
4. O relatório contém todas as seções obrigatórias e status final.
5. Uma pasta gera visão geral com links na ordem numérica.
6. Configuração inválida ou chave desconhecida falha com erro seguro.
7. Duas execuções iguais geram bytes iguais.
8. O bundle executa sem depender do `node_modules` do repositório.

