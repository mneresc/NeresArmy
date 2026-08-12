# S17 — Review

Data: 2026-08-12

## Revisão do diff

| Risco | Evidência | Estado |
| --- | --- | --- |
| pacote depender de clone ou rede durante instalação | BMAD e assets construídos presentes no `.tgz`; smoke local aprovado | PASS |
| tarball alterar arquivos por regras internas do npm | `.gitignore` e placeholders desnecessários removidos; manifesto validado sobre o tarball real | PASS |
| BMAD parcial causar mistura de versões | preflight bloqueia parcial e versão divergente antes da escrita | PASS |
| segundo cliente não receber skills BMAD | extensão 6.11.0 coberta por teste com 49 skills | PASS |
| conjunto falso com 49 diretórios ser aceito | nomes exatos comparados ao manifesto vendorizado | PASS |
| falha de cópia deixar instalação nova incompleta | rollback limitado aos destinos recém-criados | PASS |
| Claude Code permitir delegação recursiva | entry agents têm allowlists; especialistas não possuem ferramenta Agent | PASS |
| mutação de MCP ou configuração Claude | teste e smoke confirmam ausência de `settings.json` e `.mcp.json` | PASS |
| supply chain sem evidência persistente | audit runtime, SBOM, relatório e artifact de 90 dias; Dependency Review adicional quando o Graph estiver habilitado | PASS |
| vazamento de nome/caminho da máquina de build | placeholders neutros e busca negativa no vendor | PASS |
| documentação divergir por idioma | README, uso, cookbook e segurança em português, inglês e espanhol | PASS |

## Conclusão

READY FOR REMOTE CI AND PACKAGE PUBLICATION. Nenhum merge automático é autorizado.
