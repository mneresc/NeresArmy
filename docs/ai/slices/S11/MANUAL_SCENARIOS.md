# S11 — Simulações manuais

As simulações abaixo usam respostas fictícias e não criam perfis de pessoas reais.
Cada fluxo foi conferido contra `SKILL.md`, `anamnesis-protocol.md` e o contrato do
template.

## 1. Concurso, iniciante, sem amostra

- Turno 1: pede objetivo, prazo e autorização de escopo; oferece `pular`, `não sei`,
  `pausar` e `encerrar`.
- Turno 2: como não há amostra, registra `[DESCONHECIDO]` e pergunta qual formato
  de prova precisa ser resolvido.
- Desvio: propõe microteste futuro, sem declarar domínio atual.
- Handoff: recomenda coletar primeira amostra antes de personalizar questões.

## 2. TDAH autorrelatado, raciocínio avançado, execução inconsistente

- Turno 1: aceita o autorrelato sem transformar o rótulo em diagnóstico.
- Turno 2: pergunta em que competência e condição a execução falha.
- Desvio: separa força observada de barreira de início, organização ou contexto.
- Handoff: apoia o acesso sem reduzir o teto e marca a conclusão como provisória.

## 3. Idioma com leitura, fala e escrita diferentes

- Turno 1: pergunta qual tarefa-alvo e formato de avaliação importam primeiro.
- Turno 2: coleta uma amostra por competência, sem média global.
- Desvio: mantém MDAR separado para leitura, fala e escrita, com retenção e
  transferência distintas.
- Handoff: outra skill recebe adaptações específicas por competência.

## 4. Recusa de perguntas sensíveis

- Turno 1: informa que perguntas clínicas são opcionais.
- Turno 2: diante de “prefiro não responder”, registra somente a barreira funcional
  autorizada ou `[DESCONHECIDO]`.
- Desvio: não solicita diagnóstico, medicação, prontuário ou identificação.
- Handoff: `sensitive_data_storage: false` permanece preservado.

## 5. Perfil existente com prova nova

- Turno 1: encontra o perfil autorizado e oferece atualizar ou criar outro.
- Turno 2: pergunta qual prova nova pode ser analisada e em que escopo.
- Desvio: preserva afirmações sustentadas, marca a nova evidência e mostra
  “Mudanças desde a versão anterior”.
- Handoff: atualiza `updated_at` somente após confirmação explícita.

## 6. “80% de rendimento” sem contexto

- Turno 1: não interpreta o percentual como domínio.
- Turno 2: pergunta numerador, denominador, competência, dificuldade e formato da
  amostra.
- Desvio: pede tempo, ajuda, confiança, retenção e transferência antes de recomendar.
- Handoff: registra insuficiência ou uma MDAR específica, nunca uma capacidade global.

## Resultado da simulação

Todos os seis fluxos mantêm uma pergunta principal por turno, investigação antes de
perguntar quando há artefatos autorizados, confirmação antes da escrita, incerteza
explícita e ausência de inferência clínica.
