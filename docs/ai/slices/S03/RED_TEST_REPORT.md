# S03 — RED report

**RED válido** em 2026-07-23.

```text
Test Files  3 failed (3)
Tests       2 failed (2)
exit code   1
```

As suítes de adapter não foram coletadas porque os módulos públicos ainda não
existiam. Os dois testes CLI foram coletados e falharam porque as flags visuais ainda
eram desconhecidas. Runner, vaults e processo real funcionaram; não houve rede.
