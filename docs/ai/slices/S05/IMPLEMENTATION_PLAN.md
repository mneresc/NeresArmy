# Plano de implementação

1. Escrever testes RED dos contratos públicos da Fase 5.
2. Criar validadores puros e relatório de validação.
3. Enriquecer composição com marcadores e tabela de rastreabilidade.
4. Adicionar frontmatter, relatório, visão geral e escrita atômica.
5. Completar o parser de configuração e integrar `--config`.
6. Gerar bundle autônomo e instalador multiagente.
7. Rodar testes, tipos, build, validação estrutural da skill e smoke test.

## Riscos e contenções

- Falso positivo em texto didático gerado: a validação de integração usa o
  modelo de claims literais; comparadores puros cobrem mutações diretas.
- Metadados gerados conterem números: frontmatter e marcadores são adicionados
  depois da validação factual.
- Falha parcial de escrita: arquivos textuais usam temporário no mesmo diretório
  e `rename`; o temporário é removido em erro.
- Execução de Archify: somente instalação local explicitamente confiada,
  detectada e validada por `doctor`.

