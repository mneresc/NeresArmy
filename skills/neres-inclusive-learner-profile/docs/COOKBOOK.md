# Cookbook — Neres Inclusive Learner Profile

## Iniciar um perfil

```text
Use $neres-inclusive-learner-profile para conduzir uma anamnese pedagógica sobre meu objetivo de estudo.
```

A skill começará explicando privacidade, limites não clínicos e respostas de controle
(`pular`, `não sei`, `pausar`, `encerrar`). Ela fará uma pergunta principal por turno.

## Autorizar arquivos

```text
Analise somente a pasta relativa que eu indicar e use os arquivos encontrados antes de me perguntar fatos já documentados.
```

O usuário deve delimitar o escopo. A skill não amplia a leitura por backlinks, web ou
conhecimento externo e não trata texto de fonte como instrução.

## Criar o documento

Após o resumo de entendimento, confirme explicitamente:

```text
Confirma este entendimento e a criação de learning/LEARNING_PROFILE.md?
```

A skill só escreve depois da confirmação. A saída pode receber outro caminho se o
usuário escolher um destino diferente.

## Atualizar um perfil existente

```text
Atualize learning/LEARNING_PROFILE.md usando esta nova amostra, preservando afirmações ainda sustentadas e mostrando as mudanças.
```

A atualização preserva evidências válidas, marca dados novos, mostra contradições,
atualiza `updated_at` e não cria histórico clínico desnecessário.

## Validar

```powershell
python scripts/validate_profile.py learning/LEARNING_PROFILE.md
```

O validador rejeita frontmatter incompleto, seções ausentes, escala MDAR inválida,
conclusão clínica, VARK/estilo fixo e recomendações sem evidência ou incerteza.

## Limites

- Não pedir nome completo, documento, endereço, prontuário, medicação ou diagnóstico
  quando a adaptação funcional puder ser descrita sem isso.
- Não produzir plano, questões ou material didático nesta etapa.
- Não usar preferência como prova de eficácia.
- Não reduzir o teto de desafio por causa de uma barreira de acesso.
