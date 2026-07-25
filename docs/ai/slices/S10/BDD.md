# BDD — S10

## Catálogo

**Dado** um repositório com skills canônicas em `skills/<slug>` e metadados válidos,
**quando** o catálogo é gerado,
**então** ele lista cada skill uma única vez com descrição, categoria, estado,
comando de instalação e links para a documentação individual.

## Contrato de skill

**Dado** uma skill sem um arquivo obrigatório, nome divergente ou documentação com
um caminho local real,
**quando** o validador é executado,
**então** ele termina com falha e identifica a skill e a regra violada.

## Instalação individual

**Dado** duas ou mais skills no catálogo,
**quando** o instalador local recebe `--skill <slug>`,
**então** somente a pasta dessa skill é copiada para o destino escolhido.

## Instalação completa

**Dado** duas ou mais skills válidas,
**quando** o instalador local recebe `--all`,
**então** cada skill canônica é instalada uma vez no destino escolhido.

## Compatibilidade preservada

**Dado** a skill `neres-study-refinery` existente,
**quando** as validações do pacote são executadas,
**então** seu build, typecheck e testes permanecem verdes e o pacote continua
autônomo.
