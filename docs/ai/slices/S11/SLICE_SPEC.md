# S11 — Neres Inclusive Learner Profile

## Objetivo

Adicionar ao NeresArmy uma skill conversacional que conduza uma anamnese pedagógica
adaptativa e produza um perfil operacional, provisório e reutilizável em
`learning/LEARNING_PROFILE.md`.

## Inclui

- Protocolo de uma pergunta por turno, com investigação de arquivos antes de
  perguntar e confirmação explícita antes de escrever.
- Limites não clínicos, consentimento e distinção entre acesso, domínio e contexto.
- Matriz Dinâmica de Aprendizagem e Resposta (MDAR) por competência.
- Contrato Markdown estável para skills consumidoras.
- Validador determinístico e testes Python sem dependências novas.
- Skill individual documentada e registrada no catálogo NeresArmy.

## Não inclui

- Diagnóstico, tratamento, medicação ou classificação neuropsicológica.
- Geração de planos de estudo, questões ou materiais didáticos; o perfil é o
  handoff para outras skills.
- Consulta externa durante a anamnese.
- Publicação npm.

## Critérios de aceite

1. A pasta `skills/neres-inclusive-learner-profile` segue o contrato do NeresArmy.
2. `SKILL.md` contém o fluxo conversacional e os limites essenciais em menos de
   500 linhas.
3. O template contém frontmatter, as 18 seções obrigatórias e `consumer_contract`.
4. O validador rejeita perfis sem estrutura, clínicos, VARK, escalas inválidas ou
   recomendações sem evidência/incerteza.
5. Os seis casos de teste do prompt passam.
6. `npm run validate:skills`, `npm run generate:catalog` e `quick_validate.py`
   passam.

## Decisão de nomenclatura

O nome final é `neres-inclusive-learner-profile`; `mapear-perfil-aprendizagem` e
`construir-estudo-adaptativo` aparecem no prompt como nomes provisórios e não serão
usados como diretório canônico.
