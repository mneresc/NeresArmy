# S03 — Plano de testes

- `visual-manifest.test.ts`: tipos, hash e validação;
- `image-note-build.test.ts`: imagem textual e ilegível em CLI real;
- `openai-adapter.test.ts`: autorização e transporte injetado offline.

RED válido: módulos ausentes e flags CLI desconhecidas. GREEN exige suíte inteira,
typecheck, build e nenhuma rede real.
