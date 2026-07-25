# Plano RED — S11

| Cenário | Teste |
| --- | --- |
| perfil válido | fixture com frontmatter, 18 seções, MDAR e consumer contract |
| seção ausente | remover uma seção e exigir diagnóstico |
| diagnóstico indevido | incluir conclusão clínica e exigir rejeição |
| VARK | incluir recomendação de estilo fixo e exigir rejeição |
| escala inválida | usar I5/Q4/G4/R4 e exigir rejeição |
| insuficiência declarada | manter `[DESCONHECIDO]` e exigir sucesso |
| frontmatter inválido | testar enum, data, contador, lista e sintaxe incompletos |
| contrato vazio/incompleto | remover campos obrigatórios do `consumer_contract` |
| inferência clínica variante | testar “a pessoa tem TDAH” sem a frase literal anterior |
| limite clínico legítimo | permitir “este perfil não é diagnóstico clínico” |
| MDAR negativa | usar I-1/Q-1/G-1/R-1 e exigir rejeição |
| prosa sem proveniência | inserir recomendação sem marcador em seção 9 |
| regra sem proveniência | inserir `adaptation_rules` sem marcador |
| guardrail anti-VARK | permitir uma proibição explícita de VARK |

O teste será executado com `unittest` da biblioteca padrão do Python. O validador
será chamado como CLI para testar o contrato observável, sem acoplamento a funções
privadas.
