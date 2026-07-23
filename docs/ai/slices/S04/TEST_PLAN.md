# S04 — Plano de testes

- `candidate-scoring.test.ts`: score e tipo;
- `topology-validation.test.ts`: input e output adversarial;
- `archify-adapter.test.ts`: CLI compatível falso, HTML/SVG e erro de instalação;
- `diagram-build.test.ts`: integração CLI/vault.

RED válido: módulos/flags ausentes. Nenhum teste depende da instalação pessoal ou de
rede; a instalação real é validada por smoke test separado.
