# S17 — Relatório GREEN

Data: 2026-08-12

## Resultado

O pacote `@mneresc/neres-agentic-bmad@0.2.0` está pronto para validação remota e
publicação. A instalação não depende de clone: o tarball contém o core BMAD
6.11.0, 49 skills BMAD, assets dos quatro clientes e documentação trilíngue.

| Evidência | Resultado |
| --- | --- |
| testes e validadores do workspace | 33/33 testes; Codex, OpenCode, Devin, Claude Code e BMAD aprovados |
| gate completo `npm run check` | 4 skills, 3 testes de catálogo, 33 testes do agente, 69 Vitest, 38 Python, typecheck e build aprovados |
| inspeção de `npm pack` | 382 arquivos, aproximadamente 542 KB; sem testes, fixtures, caches Python ou configuração pessoal |
| smoke do `.tgz` | versão 0.2.0 e instalação Claude Code real aprovadas |
| conteúdo instalado pelo `.tgz` | 14 agentes, 49 skills BMAD, protocolo Neres e core `_bmad` |
| idioma | `--language pt` configurou `Portuguese (Brazil)` no BMAD instalado |
| configurações Claude | `settings.json` e `.mcp.json` não foram criados nem alterados |
| relatório supply chain | 0 vulnerabilidades runtime em todos os níveis; SBOM CycloneDX gerado |
| `npm publish --dry-run --access public` | aprovado para a versão 0.2.0 |

## Contratos preservados

- Devin continua neutro em relação a providers, modelos, MCPs e skills disponíveis.
- Instalações BMAD completas são preservadas; novo cliente é estendido somente
  quando o core existente é 6.11.0.
- Estado BMAD parcial ou incompatível falha antes de instalar os assets Neres.
- Operações multi-cliente executam preflight em todos os destinos antes da escrita.
- Falhas inesperadas durante a cópia removem somente os destinos recém-criados.

Os diretórios temporários e o tarball do smoke devem ser removidos após o registro
das evidências.
