# S04 — RED report

**RED válido** em 2026-07-23.

```text
Test Files  4 failed (4)
Tests       1 failed (1)
exit code   1
```

Três suítes não foram coletadas por módulos públicos ausentes. A integração CLI foi
coletada e falhou porque `--archify-path` ainda não existia. O runner e o fake CLI
foram criados sem dependência externa ou rede.
