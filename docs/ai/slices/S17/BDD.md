# S17 — BDD

## Seleção interativa

**Dado** o CLI sem destino **quando** o usuário seleciona Claude Code e Codex
**então** os dois instaladores são executados na ordem exibida e nenhum cliente
não selecionado é alterado.

## BMAD ausente

**Dado** um projeto sem `_bmad` **quando** um destino é instalado **então** o
BMAD 6.11.0 e suas 49 skills são copiados exclusivamente dos assets do pacote.

## BMAD existente

**Dado** um projeto com manifest BMAD **quando** o pacote é instalado **então** a
instalação existente é preservada e o resultado informa `existing`.

## BMAD parcial

**Dado** um `_bmad` sem manifest válido **quando** a instalação começa **então**
ela falha antes de misturar arquivos, explicando a correção necessária.

## Claude Code

**Dado** um destino Claude Code vazio **quando** a instalação termina **então**
3 entry agents, 11 subagentes e 1 skill de protocolo existem nos caminhos nativos.

## Supply chain

**Dado** um pull request **quando** o workflow de segurança executa **então**
dependências novas são revisadas, vulnerabilidades high/critical bloqueiam o gate,
um SBOM e um relatório legível são armazenados como artefatos.
