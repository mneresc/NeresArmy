# BDD — S11

## Contrato válido

**Dado** um perfil com frontmatter correto, seções obrigatórias, marcadores de
proveniência, incerteza e contrato de consumo, **quando** o validador é executado,
**então** ele termina com sucesso.

## Estrutura incompleta

**Dado** um perfil sem uma seção obrigatória, **quando** o validador é executado,
**então** ele falha identificando a seção ausente.

## Limite clínico

**Dado** um perfil que apresenta diagnóstico clínico como conclusão, **quando** o
validador é executado, **então** ele falha e aponta a violação não clínica.

## Limite contra tipologias

**Dado** um perfil que recomenda VARK ou um estilo fixo de aprendizagem, **quando**
o validador é executado, **então** ele falha.

## Escalas MDAR

**Dado** um perfil com valor fora das escalas I0–I4, Q0–Q3, G0–G3 ou R0–R3,
**quando** o validador é executado, **então** ele falha indicando a escala inválida.

## Incerteza honesta

**Dado** um perfil com dados insuficientes, mas que marca os campos como
`[DESCONHECIDO]` ou `incerteza`, **quando** o validador é executado, **então** ele
continua válido sem inventar domínio.
