# Plano RED — S10

| Cenário BDD | Tipo | Evidência |
| --- | --- | --- |
| Catálogo lista cada skill uma vez | unitário Node | descoberta e Markdown gerado em fixture temporária |
| Validador rejeita contrato inválido | unitário Node | diagnósticos para arquivo ausente, nome divergente e caminho local |
| Instalação por `--skill` | integração Node | destino temporário contém somente a skill selecionada |
| Instalação por `--all` | integração Node | destino temporário contém todas as skills válidas |
| Compatibilidade preservada | checks existentes | `npm run check` no workspace publicado |

Os testes de catálogo usarão `node:test` e fixtures temporárias. Assim não exigem
nova dependência e verificam contratos públicos de arquivos e CLI, não detalhes
privados de implementação.
