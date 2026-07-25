# Plano de implementação — S11

## Aprovação

Autorização humana registrada: “baseado nesse plano execute o prompt anexo”.

## Ordem

1. Inicializar a skill com `init_skill.py` em `skills/neres-inclusive-learner-profile`.
2. Criar os testes RED e confirmar que o validador ainda não existe.
3. Implementar `validate_profile.py` sem dependências novas.
4. Escrever template, referências e `SKILL.md` operacional em português.
5. Adicionar README, cookbook e `catalog.json` exigidos pelo NeresArmy.
6. Validar a skill, o perfil de exemplo, o catálogo e os testes existentes.
7. Registrar GREEN/review, commit separado e push somente após todos os checks.

## Arquivos previstos

- `skills/neres-inclusive-learner-profile/SKILL.md`
- `skills/neres-inclusive-learner-profile/agents/openai.yaml`
- `skills/neres-inclusive-learner-profile/references/*.md`
- `skills/neres-inclusive-learner-profile/scripts/validate_profile.py`
- `skills/neres-inclusive-learner-profile/scripts/test_validate_profile.py`
- `skills/neres-inclusive-learner-profile/assets/LEARNING_PROFILE.template.md`
- `skills/neres-inclusive-learner-profile/README.md`
- `skills/neres-inclusive-learner-profile/docs/COOKBOOK.md`
- `skills/neres-inclusive-learner-profile/catalog.json`

## Não alterações

- Nenhuma alteração no runtime `neres-study-refinery`.
- Nenhuma dependência Python ou JavaScript nova.
- Nenhum dado de pessoa real.
