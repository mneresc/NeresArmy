# S11 — RED test report de remediação

## Comando

```powershell
python skills/neres-inclusive-learner-profile/scripts/test_validate_profile.py
```

## Resultado RED

- 18 testes executados;
- 12 falharam pelo comportamento ausente;
- 6 permaneceram verdes e não foram relaxados.

As falhas provaram: enum de confiança não validado, `valid_until` inválido aceito,
contador textual aceito, frontmatter malformado aceito, `consumer_contract` vazio
ou incompleto aceito, inferência clínica variante aceita, MDAR negativa aceita,
recomendação em prosa/regra sem proveniência aceita e guardrails legítimos rejeitados.

## Integridade do RED

Não houve falha de setup, teste vazio, skip ou dependência de método privado. Todos
os casos chamam a CLI pública e verificam código de saída e mensagem útil.
