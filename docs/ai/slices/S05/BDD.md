# BDD

## Cenário: conteúdo suportado

**Dado** um claim literal extraído de uma fonte autorizada  
**Quando** a nota V2 é composta  
**Então** o trecho possui um marcador `claimId` e aparece na rastreabilidade.

## Cenário: mutação factual

**Dado** um conteúdo fonte com número, modalidade, fórmula ou código  
**Quando** a saída introduz valor divergente  
**Então** a validação informa a divergência e a transformação falha.

## Cenário: transformação de pasta

**Dado** um diretório com notas numeradas  
**Quando** a transformação termina  
**Então** `_Visão Geral.md` aponta para cada V2 em ordem natural e o relatório
agregado registra o resultado.

## Cenário: configuração segura

**Dado** um YAML parcial conhecido  
**Quando** ele é carregado  
**Então** sobrescreve somente os valores fornecidos.

**Dado** um enum ou chave desconhecida  
**Quando** o YAML é carregado  
**Então** a CLI falha antes de ler ou escrever o vault.

## Cenário: escrita segura

**Dado** um destino válido  
**Quando** o arquivo é gravado  
**Então** a troca é atômica e nenhum temporário permanece.

