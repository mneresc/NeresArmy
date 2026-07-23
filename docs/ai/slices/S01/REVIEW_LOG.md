# S01 — Review log

## Veredito inicial

**BLOCKED** em 2026-07-23. Os 24 testes existentes e o build estavam verdes, mas a
auditoria de boundary encontrou dois caminhos não cobertos que impediam declarar a
Fase 1 pronta.

## Achados

### P1 — Output padrão podia resolver para fora do vault

`resolveScope()` aplicava `resolveOutputWithinVault()` apenas ao `--output`
customizado. O output padrão era montado lexicalmente. Se `_V2` já fosse um junction
ou symlink para fora do vault, o plano aceitaria um destino externo. S01 não escreve,
mas esse contrato alimentará as fases que escrevem e, portanto, deve falhar fechado
agora.

Prova corretiva necessária:

- criar `_V2` como junction para fora do vault;
- executar o dry-run sem `--output`;
- exigir erro de boundary e zero escrita.

### P1 — Traversal podia seguir aliases de diretório e ciclos

`collectFolder()` verificava exclusões e output no caminho lexical antes de resolver o
destino real. Um junction interno com nome diferente poderia apontar para `_V2`, para
um diretório excluído ou para um ancestral, contornando a política ou causando
recursão repetida.

Prova corretiva necessária:

- junction com alias para o output deve ser rejeitado;
- junction que aponta para um ancestral não pode causar recursão;
- diretórios reais já visitados devem ser deduplicados.

### P2 — Validação de configuração ainda não prova enums

O plano RED previa rejeição de enum inválido. A implementação valida tipos, mas faz
cast de `profile`, `compression`, `diagrams.mode`, `output.mode` e
`diagrams.provider` sem validar os conjuntos permitidos. O teste atual apenas procura
strings no YAML. Não bloqueia o boundary de S01, mas precisa ser fechado antes de
aceitar configuração customizada em slice posterior.

## Contratos, segurança e testes

- BDD público coberto: caminhos externos, colisão direta, dry-run sem escrita,
  exclusões, determinismo, ajuda e defaults.
- Testes são orientados ao processo CLI e filesystem real, sem acoplamento a helpers
  privados.
- Nenhum teste RED foi removido, relaxado, marcado como skip ou TODO.
- Não há rede, telemetria nem chamada de modelo na Fase 1.
- Observabilidade atual é suficiente para planejamento: códigos estáveis e caminhos,
  sem conteúdo de nota em erros.

## Próximo passo

Adicionar primeiro os testes de regressão dos dois P1, confirmar RED pelo motivo
correto, implementar a correção mínima, executar toda a suíte e atualizar este log
com o veredito final.

## Correção e reauditoria

Os três testes de regressão foram adicionados antes da implementação e falharam pelo
motivo esperado:

- output padrão externo terminou com código `0`;
- alias de output listou `gerado.md` como fonte;
- ciclo interno excedeu o timeout de 5 segundos.

A correção mínima passou a:

- resolver e validar tanto o output padrão quanto o customizado;
- comparar o destino real de diretórios com o output e os segmentos excluídos;
- registrar diretórios reais visitados para impedir aliases duplicados e ciclos.

Gate final:

```text
tsc --noEmit
Test Files  6 passed (6)
Tests       27 passed (27)
tsc -p tsconfig.build.json
exit code: 0
```

Coverage final do runner: 98,52% statements/lines, 85,71% branches e 100% functions.
Como os testes CLI usam processos filhos reais, o número instrumental não representa
sozinho a produção; a prova principal continua sendo o comportamento E2E sobre
filesystem real.

## Veredito final

**READY para o commit da Fase 1**, sem achados P0/P1 abertos.

Risco residual:

- a validação de enums do YAML permanece P2 e deve ser fechada antes de introduzir
  configuração fornecida pelo usuário;
- não foi executada telemetria, rede ou modelo, conforme contrato da fase;
- nenhuma aprovação de merge ou publicação remota é concedida por esta review.
