# S11 — Simulações manuais

As conversas abaixo são fictícias, não representam pessoas reais e não geram
arquivos de perfil. Cada fala do agente contém exatamente uma pergunta principal.

## 1. Concurso, iniciante, sem amostra

### Turno 1

**Agente:** Você pode pular, pausar ou encerrar; nenhuma informação clínica é
necessária. Qual resultado observável você precisa alcançar?

**Usuário fictício:** Resolver uma prova objetiva de concurso.

### Turno 2

**Agente:** O prazo muda a prioridade entre cobertura e profundidade. Qual é a data
da prova?

**Usuário fictício:** Ainda não há data confirmada.

### Turno 3

**Agente:** Sem amostra eu não devo inferir domínio. Você possui alguma prova ou
bloco de questões autorizado para análise?

**Usuário fictício:** Não.

### Confirmação

**Agente:** Recomendo registrar evidência insuficiente e coletar uma microamostra
antes de personalizar. Você confirma esse entendimento?

**Usuário fictício:** Confirmo.

**Handoff:** `[DESCONHECIDO]` em domínio e MDAR; objetivo confirmado; próxima
medição definida; nenhuma inferência clínica.

## 2. TDAH autorrelatado, raciocínio avançado e execução inconsistente

### Turno 1

**Agente:** O rótulo é opcional e não será usado como diagnóstico. Em qual tarefa
observável a execução se torna inconsistente?

**Usuário fictício:** Em questões longas, começo bem e abandono etapas.

### Turno 2

**Agente:** Isso ajuda a separar domínio de condição de execução. Existe uma amostra
em que o mesmo conteúdo foi resolvido com outro formato?

**Usuário fictício:** Sim, em blocos curtos resolvi corretamente.

### Turno 3

**Agente:** A diferença sugere testar apoio de segmentação sem reduzir o desafio.
Qual foi o menor apoio que permitiu concluir a tarefa?

**Usuário fictício:** Um checklist curto.

### Confirmação

**Agente:** Registrarei o TDAH apenas como `[AUTORRELATO]` se houver consentimento e
a recomendação como resposta observada ao checklist. Você confirma?

**Usuário fictício:** Confirmo somente a necessidade funcional, sem registrar TDAH.

**Handoff:** força preservada; barreira funcional de execução; checklist como apoio
provisório; retirada progressiva condicionada à independência.

## 3. Idioma com leitura, fala e escrita diferentes

### Turno 1

**Agente:** As competências não serão combinadas em uma média global. Qual delas é
prioritária para o seu objetivo atual?

**Usuário fictício:** Fala.

### Turno 2

**Agente:** Uma amostra próxima ao desempenho-alvo é a melhor evidência. Existe uma
gravação transcrita autorizada para análise?

**Usuário fictício:** Sim.

### Turno 3

**Agente:** A leitura só deve alterar a recomendação de fala se houver evidência de
transferência. Você possui uma amostra recente de leitura?

**Usuário fictício:** Tenho uma prova, mas nenhuma amostra de escrita.

### Confirmação

**Agente:** Manterei MDAR separada para fala e leitura e escrita como
`[DESCONHECIDO]`. Você confirma?

**Usuário fictício:** Confirmo.

**Handoff:** MDAR independente por competência; fala prioritária; escrita sem
personalização por ausência de dados.

## 4. Recusa de perguntas sensíveis

### Turno 1

**Agente:** Você pode recusar qualquer dado sensível e descrever apenas a barreira
funcional. Posso perguntar sobre a condição em que o formato se torna inacessível?

**Usuário fictício:** Prefiro não responder perguntas clínicas.

### Turno 2

**Agente:** Respeitarei a recusa e não registrarei condição médica. Qual mudança de
formato torna a tarefa executável?

**Usuário fictício:** Mais espaço entre linhas e instruções divididas.

### Confirmação

**Agente:** Registrarei apenas essas necessidades funcionais com
`sensitive_data_storage: false`. Você confirma?

**Usuário fictício:** Confirmo.

**Handoff:** recusa preservada; nenhum diagnóstico, medicação ou prontuário;
adaptações funcionais acionáveis.

## 5. Perfil existente atualizado com prova nova

### Turno 1

**Agente:** Encontrei um perfil anterior no escopo autorizado. Você quer atualizá-lo
ou criar um perfil independente?

**Usuário fictício:** Atualizar.

### Turno 2

**Agente:** A nova prova pode alterar somente as competências que ela mede. Posso
analisar esse arquivo?

**Usuário fictício:** Sim.

### Turno 3

**Agente:** A prova contradiz uma inferência antiga sobre retenção, mas não altera as
forças observadas. Qual fonte deve prevalecer para esta atualização?

**Usuário fictício:** A prova nova.

### Confirmação

**Agente:** Preservarei claims sustentados, mostrarei a contradição e atualizarei
`updated_at` e “Mudanças desde a versão anterior”. Você confirma?

**Usuário fictício:** Confirmo.

**Handoff:** evidência nova identificada; decisão de autoridade confirmada; histórico
clínico não acumulado.

## 6. “80% de rendimento” sem contexto

### Turno 1

**Agente:** Um percentual isolado não prova domínio. O 80% corresponde a quantos
acertos de quantas tentativas?

**Usuário fictício:** Oito acertos em dez questões.

### Turno 2

**Agente:** O tamanho da amostra ainda é pequeno. Qual competência essas questões
mediam?

**Usuário fictício:** Misturavam três assuntos.

### Turno 3

**Agente:** A mistura impede atribuir o resultado a uma competência específica.
Houve consulta ou ajuda durante a resolução?

**Usuário fictício:** Consultei duas respostas.

### Turno 4

**Agente:** Recomendo registrar a amostra sem concluir domínio e repetir a medição
sem consulta. Você confirma?

**Usuário fictício:** Confirmo.

**Handoff:** `8/10`, amostra pequena e heterogênea, ajuda registrada, retenção e
transferência desconhecidas, nenhuma capacidade global inferida.

## Resultado

Os seis fluxos preservam uma pergunta principal por turno, controle do usuário,
desvio adaptativo, incerteza explícita, ausência de inferência clínica e handoff
suficiente para uma skill consumidora decidir quando agir ou pedir nova evidência.
