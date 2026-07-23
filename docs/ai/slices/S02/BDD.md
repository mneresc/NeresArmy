# S02 — BDD

## Cenários

1. **Inventário completo:** dado Markdown com heading, tabela, código, fórmula,
   callout, wikilink e embed, quando analisado, então todos os elementos, hash,
   tamanho e status são registrados sem seguir links.
2. **Estado da fonte:** dada uma nota fragmentada e outra com tabela
   `Item/Regra/Consequência`, quando classificadas, então retornam `raw` e
   `structured`.
3. **Perfis:** dados textos normativo, matemático, técnico e misto, quando o perfil é
   automático, então retornam `law-afo`, `mathematics`, `technical-it` e `hybrid`;
   perfil manual sempre prevalece.
4. **Evidência:** dado conteúdo autorizado, quando o content model é criado, então
   cada claim supported possui `sourceId`, path, heading e excerpt literal.
5. **Preservação estruturada:** dada nota AFO organizada, quando composta, então
   tabela, callout e Edge cases permanecem semanticamente idênticos.
6. **Composição por perfil:** dadas notas brutas dos três perfis, quando compostas,
   então recebem respectivamente `Visão central`, `Ideia central` e
   `Função central`, sem seção vazia nem exemplo inventado.
7. **Build de nota:** dado output separado, quando `build` executa, então cria V2 e
   artefatos `_audit`, mantendo o original byte a byte.
8. **Build de pasta:** dada árvore autorizada, quando `build` executa, então espelha
   apenas Markdown suportado no output e nunca reutiliza `_V2`.
9. **Idempotência:** dada a mesma origem e configuração, quando executada duas vezes,
   então a saída tem os mesmos bytes.
10. **Fonte fechada:** wikilink e link web são inventariados, mas nenhum destino é
    lido e nenhum conteúdo externo aparece na V2.

## Critério GREEN

Todos os cenários passam por API pública ou processo CLI real, sem mocks de
filesystem, rede ou conteúdo.
