# Contrato de `LEARNING_PROFILE.md`

## Frontmatter mínimo

```yaml
---
profile_schema: learning-profile/v1
profile_status: provisional
created_at: YYYY-MM-DD
updated_at: YYYY-MM-DD
scope:
  subjects: []
  goals: []
  valid_until: null
consent:
  sensitive_data_storage: false
  artifact_analysis: true
evidence_summary:
  observed_artifacts: 0
  self_report_items: 0
  micro_assessments: 0
  overall_confidence: low
---
```

`profile_status` só pode ser `provisional` ou `user_confirmed`. Datas devem ser
ISO-8601. `valid_until` aceita data ISO ou `null`; contadores são inteiros não
negativos; consentimentos são booleanos; `subjects` e `goals` são listas; e
`overall_confidence` aceita `low`, `moderate` ou `high`. A confirmação do usuário é
necessária antes de usar `user_confirmed`.

## Seções obrigatórias

1. Como usar este documento
2. Escopo, objetivo e prazo
3. Fontes e evidências analisadas
4. Síntese operacional
5. Forças e teto de desafio
6. Barreiras funcionais e de acesso
7. Apoios eficazes, ineficazes e ainda não testados
8. MDAR por competência
9. Recomendações para desenho de materiais
10. Recomendações para questões e feedback
11. Recomendações para sessões e revisões
12. Acessibilidade sem redução de expectativa
13. Compactação, enriquecimento ou aceleração
14. Contextos que alteram o desempenho
15. Regras de adaptação para outras skills
16. Incertezas, contradições e dados faltantes
17. Gatilhos para reavaliação
18. Limites não clínicos e consentimento

## Proveniência e MDAR

Toda conclusão importante recebe um marcador: `[OBSERVADO]`, `[AUTORRELATO]`,
`[INFERÊNCIA — confiança baixa/moderada/alta]`, `[CONFIRMADO PELO USUÁRIO]` ou
`[DESCONHECIDO]`. A MDAR é específica por competência e usa I0–I4, Q0–Q3, G0–G3
e R0–R3, sem média global.

## Contrato de consumo

```yaml
consumer_contract:
  may_use:
    - confirmed_goals
    - observed_strengths
    - functional_access_needs
    - evidence_backed_supports
    - competency_specific_mdar
  must_not_infer:
    - clinical_diagnosis
    - intelligence_level
    - fixed_learning_style
    - global_capacity_from_one_subject
  adaptation_rules: []
  recheck_when: []
```

Skills consumidoras tratam o perfil como entrada consultiva e reavaliável, nunca
como ordem clínica ou verdade permanente.
