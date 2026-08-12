# S16 — Especificação

## Interface

```text
neres-agentic install <codex|opencode|devin> [options]
neres-agentic install --target <codex|opencode|devin> [options]
neres-agentic --help
neres-agentic --version
```

Para Devin, `--scope project|user` controla o destino. As opções específicas dos
instaladores existentes continuam disponíveis: `--dry-run`, `--force`, `--json`,
`--models-file`, `--backup-dir`, `--codex-home`, `--config-dir` e
`--destination-root`.

## Comportamento

- Target ausente ou inválido falha com mensagem acionável e sem escrita.
- Opção incompatível com o target falha antes de chamar o instalador.
- O CLI invoca Node diretamente, sem shell e sem interpolar comandos.
- O exit code do instalador é preservado.
- `--scope` só é aceito para Devin e vira o target project/user do instalador Devin.
- O pacote publicado contém somente runtime, assets e documentação necessários.
- O pacote declara Node.js 22.12+ e licença MIT.

## Aceite

- Dry-run de cada runtime funciona a partir do pacote, usando fixtures nos testes.
- Instalação em temporários continua preservando arquivos não gerenciados.
- `npm pack --dry-run --json` mostra bin, scripts, assets e documentação, sem testes,
  fixtures de desenvolvimento, `docs/ai` ou conteúdo de outras skills.
