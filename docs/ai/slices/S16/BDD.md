# S16 — BDD

## Cenário 1 — Help sem efeitos colaterais

**Dado** o pacote executável
**Quando** o usuário executa `neres-agentic --help`
**Então** vê os três targets e exemplos npx
**E** nenhum destino é escrito.

## Cenário 2 — Codex por npx

**Dado** um inventário Codex válido e um home temporário
**Quando** o usuário executa `install codex --dry-run`
**Então** o instalador Codex valida o bundle e lista quinze destinos sem escrever.

## Cenário 3 — OpenCode por npx

**Dado** um inventário OpenCode válido e um config root temporário
**Quando** o usuário executa `install opencode --dry-run`
**Então** o instalador OpenCode lista quatorze destinos sem alterar `opencode.jsonc`.

## Cenário 4 — Devin por projeto

**Dado** um inventário Devin válido e um projeto temporário
**Quando** o usuário executa `install devin --scope project --dry-run`
**Então** lista quatro skills e onze subagentes sob `.agents` sem escrever.

## Cenário 5 — Entrada inválida

**Dado** um target ausente, desconhecido ou uma opção incompatível
**Quando** o CLI valida os argumentos
**Então** termina com código diferente de zero
**E** informa como corrigir
**E** não chama nenhum instalador.

## Cenário 6 — Pacote publicável

**Dado** o manifest npm
**Quando** o tarball é inspecionado
**Então** contém todo o runtime necessário
**E** não contém material de desenvolvimento ou outras skills.
