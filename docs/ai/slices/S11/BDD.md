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

## Frontmatter tipado

**Dado** um perfil com data, enumeração, contador, lista ou YAML inválido, **quando**
o validador é executado, **então** ele falha identificando o campo incorreto.

## Contrato de consumo estável

**Dado** um perfil com `consumer_contract` vazio, incompleto ou com chave estrutural
desconhecida, **quando** o validador é executado, **então** ele falha indicando a
parte ausente ou inesperada.

## Guardrail clínico contextual

**Dado** uma inferência que conclui TDAH, autismo, dislexia, deficiência intelectual
ou altas habilidades, **quando** o validador é executado, **então** ele falha; mas
uma declaração explícita de limite não clínico continua válida.

## Recomendação rastreável

**Dado** uma recomendação em bullet, prosa ou regra de adaptação sem marcador de
proveniência, **quando** o validador é executado, **então** ele falha.

## Escala MDAR inferior

**Dado** um perfil com valor negativo em I/Q/G/R, **quando** o validador é executado,
**então** ele falha indicando a escala inválida.
