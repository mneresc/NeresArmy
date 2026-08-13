# S18.1 — BDD

## Cenário 1 — Diagnóstico conclusivo e pequeno

**Dado** que a pessoa relata um bug reproduzível e fornece contexto suficiente

**Quando** inicia `neres-bug-doctor` em qualquer cliente suportado

**Então** o agente coleta evidências sem editar o projeto, registra causa-raiz e
confiança no `BugReport`, aplica a lente de casos-limite quando pertinente e
recomenda o nosso `neres-quick-dev` para uma mudança local de baixo risco.

## Cenário 2 — Evidência insuficiente

**Dado** que o sintoma não pode ser reproduzido ou a causa permanece incerta

**Quando** o diagnóstico termina

**Então** o `BugReport` usa `needs-more-evidence`, descreve o que falta e não
inventa causa, fix ou autorização de implementação.

## Cenário 3 — Bug incompatível com quick-dev

**Dado** que a causa envolve segurança, autenticação, banco, migration,
concorrência, contrato público ou arquitetura

**Quando** o agente classifica o risco e o impacto

**Então** o `BugReport` recomenda `neres-planner` e não encaminha diretamente
para implementação.

## Cenário 4 — Instalação multiplataforma segura

**Dado** um pacote válido e um destino Codex, OpenCode, Devin ou Claude Code

**Quando** o instalador executa em dry-run ou instalação real

**Então** `neres-bug-doctor` aparece ao lado das três entradas existentes, os
arquivos não gerenciados permanecem intactos e conflitos seguem a política de
backup recuperável.

## Cenário 5 — Documentação pública coerente

**Dado** que a pessoa consulta o README ou guia de uso em português, inglês ou
espanhol

**Quando** procura a entrada de diagnóstico

**Então** encontra o comando nativo, os limites read-only e o handoff para o
nosso `neres-quick-dev`.

## Rastreabilidade

- critérios 1–4 e 12: cenário 4;
- critérios 5–8: cenários 1–3;
- critérios 9–11: cenários 1–3;
- critério 13: cenário 5.
