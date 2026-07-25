# Plano RED — S11

| Cenário | Teste |
| --- | --- |
| perfil válido | fixture com frontmatter, 18 seções, MDAR e consumer contract |
| seção ausente | remover uma seção e exigir diagnóstico |
| diagnóstico indevido | incluir conclusão clínica e exigir rejeição |
| VARK | incluir recomendação de estilo fixo e exigir rejeição |
| escala inválida | usar I5/Q4/G4/R4 e exigir rejeição |
| insuficiência declarada | manter `[DESCONHECIDO]` e exigir sucesso |

O teste será executado com `unittest` da biblioteca padrão do Python. O validador
será chamado como CLI para testar o contrato observável, sem acoplamento a funções
privadas.
