# S11 — GREEN report

## Implementado

- Skill `neres-inclusive-learner-profile` criada com o scaffolding oficial do
  `skill-creator`.
- Entrevista adaptativa de uma pergunta por turno, consentimento, escopo,
  investigação autorizada e confirmação antes de gravar.
- Contrato `LEARNING_PROFILE.md` com 18 seções, proveniência, MDAR por competência,
  incerteza e `consumer_contract`.
- Validador determinístico sem dependências externas.
- README, Cookbook, template, referências científicas e referência de inspiração
  com licença.
- Skill registrada no catálogo raiz e pronta para instalação individual via `npx`.

## Evidência de GREEN

| Verificação | Resultado |
| --- | --- |
| `test_validate_profile.py` | 18/18 testes passaram |
| Template `LEARNING_PROFILE.md` | Renderização com datas válida |
| `python -X utf8 .../quick_validate.py` | Skill is valid |
| `npm run validate:skills` | 2 skills validadas |
| `npm run generate:catalog` | Catálogo gerado com 2 skills |
| Testes do catálogo | 3/3 passaram |
| `npm run check` | 18 testes Python, 3 testes de catálogo, typecheck, 69 testes Vitest e build passaram |
| Simulações manuais | 6/6 diálogos fictícios, uma pergunta por turno |

## Remediação da auditoria

- Frontmatter v1 agora possui parser estrito e valida tipos, datas, listas, enums,
  contadores, duplicações, campos desconhecidos e indentação.
- `consumer_contract` exige estrutura e valores estáveis.
- Inferências clínicas variantes e MDAR fora dos limites são rejeitadas.
- Declarações negativas legítimas sobre diagnóstico ou VARK são aceitas.
- Proveniência cobre bullets, prosa e regras adaptativas.
- Testes Python fazem parte de `npm test` e `npm run check`.
- Privacidade explícita, expertise reversal e fontes rastreáveis foram adicionados.
- As fases de remediação foram separadas em commits RED, GREEN e QA.

## Limite conhecido

O validador verifica schema, estrutura e guardrails textuais. Ele não interpreta
semântica clínica livre, não é teste psicométrico e não substitui julgamento
pedagógico humano. No Windows, o validador oficial de estrutura da skill precisa ser
executado em modo UTF-8 porque o script externo usa a codificação padrão do sistema.
