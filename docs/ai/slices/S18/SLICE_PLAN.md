# S18 — Plano de slice

## S18.1 — Bug Doctor multiplataforma

Entregar atomicamente o contrato de diagnóstico read-only, as quatro superfícies
nativas, o roteamento explícito para o nosso `neres-quick-dev`, instaladores,
validadores, testes e documentação PT/EN/ES.

O slice é único porque o pacote promete suporte equivalente aos quatro clientes;
separá-los deixaria uma versão publicável com contrato inconsistente.

## Resultado observável

Após instalar o pacote em qualquer cliente suportado, a pessoa consegue iniciar
`neres-bug-doctor`, receber um `BugReport` baseado em evidência e encaminhá-lo
sem autorização implícita para o `neres-quick-dev` ou para o `neres-planner`.
