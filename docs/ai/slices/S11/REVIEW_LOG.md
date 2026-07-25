# S11 — Review log

## Auditoria de escopo

- A skill produz apenas perfil/anamnese e handoff; não cria plano de estudo,
  questões ou material didático.
- Não diagnostica, não prescreve tratamento e não converte rótulo clínico em
  recomendação automática.
- Não usa VARK, estilo fixo, preferência isolada ou percentual bruto como prova de
  capacidade global.
- Mantém o teto de desafio e separa domínio do conteúdo, acesso ao formato,
  execução contextual e evidência insuficiente.

## Auditoria de contrato

- Frontmatter limita status, datas, consentimento e resumo de evidências.
- As 18 seções obrigatórias e a MDAR possuem nomes estáveis.
- Recomendações precisam de marcador de evidência ou incerteza.
- O `consumer_contract` restringe o que skills consumidoras podem usar ou inferir.

## Auditoria de portabilidade

- Nenhuma documentação da skill contém caminho de pasta real do usuário.
- Não há dependência nova de runtime.
- A skill é instalável como unidade pelo catálogo NeresArmy.

## Simulações manuais

Os seis cenários exigidos no prompt foram registrados em
`MANUAL_SCENARIOS.md`: iniciante sem amostra, TDAH autorrelatado, idioma com
competências distintas, recusa de dados sensíveis, atualização de perfil e
percentual sem contexto. Cada fluxo mantém uma pergunta por turno e handoff
incerto quando faltam dados.
