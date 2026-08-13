# Segurança e supply chain

[Português](SECURITY.md) · [English](SECURITY.en.md) · [Español](SECURITY.es.md)

## Evidência automatizada

O workflow `Supply Chain Security` executa em pull requests, pushes em `main` e
manualmente. A revisão comparativa de dependências é exclusiva de pull requests;
os demais controles também executam em pushes e acionamentos manuais. Ele:

1. tenta revisar dependências adicionadas com GitHub Dependency Review e OpenSSF;
2. bloqueia vulnerabilidades runtime high/critical com `npm audit`;
3. executa todos os validadores do pacote e do BMAD vendorizado;
4. gera `npm-audit.json`, SBOM CycloneDX e `SUPPLY_CHAIN_REPORT.md`;
5. publica os três arquivos como artefato por 90 dias e resume o relatório no job.

O Dependency Review exige que o Dependency Graph esteja habilitado no repositório.
Quando ele não está disponível, o workflow registra um aviso e mantém como gates
obrigatórios o audit de runtime, o SBOM e a validação integral do vendor.

A análise independente do pacote publicado está no
[Socket](https://socket.dev/npm/package/%40mneresc%2Fneres-agentic-bmad).

## BMAD vendorizado

`vendor/bmad/PROVENANCE.json` fixa origem, versão `6.11.0`, licença MIT, shasum e
integridade npm. `VENDOR_MANIFEST.json` contém SHA-256 e tamanho de cada arquivo.
O gate rejeita ausência, alteração, cache Python ou número inesperado de skills.

Somente a saída construída é distribuída. Dependências e scripts de instalação do
instalador upstream não são enviados nem executados no computador consumidor.

## Relatar vulnerabilidade

Não publique secrets ou detalhes exploráveis em issue pública. Use o canal de
security advisory privado do repositório GitHub quando disponível.
