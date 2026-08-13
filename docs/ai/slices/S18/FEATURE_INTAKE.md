# S18 — Intake

## Objetivo

Adicionar `neres-bug-doctor` como ponto de entrada de diagnóstico de bugs em
Codex, OpenCode, Devin CLI/Desktop e Claude Code. O agente deve reproduzir o
problema, separar sintoma de causa-raiz, analisar casos-limite com BMAD e gerar
um `BugReport` compacto antes de encaminhar o trabalho.

## Atores

- pessoa que relata um bug e fornece sintomas, logs ou passos de reprodução;
- `neres-bug-doctor`, responsável somente pelo diagnóstico;
- `neres-quick-dev`, responsável pelo QuickPlan e eventual reparo pequeno;
- `neres-planner`, destino para risco ou escopo incompatível com quick-dev.

## Escopo

- descoberta neutra de skills, MCPs e ferramentas determinísticas disponíveis;
- reprodução e coleta de evidência sem editar produção;
- lente BMAD `bmad-review`/`edge-case-hunter` quando aplicável;
- contrato estruturado `BugReport` com confiança e rota recomendada;
- entrada nativa e instalação nos quatro clientes já suportados;
- restauração da entrada `neres-quick-dev` no bundle OpenCode, já prometida pela
  documentação e necessária para o novo handoff;
- documentação em português, inglês e espanhol;
- testes e validadores do pacote.

## Fora de escopo

- implementar o fix dentro do `neres-bug-doctor`;
- substituir ou alterar o protocolo de duas fases do `neres-quick-dev`;
- instalar, autenticar ou configurar MCPs e skills externas;
- adicionar dependência runtime, publicar npm ou fazer merge automático.

## Restrições e riscos

- diagnóstico inconclusivo não pode ser apresentado como causa confirmada;
- segurança, auth, banco, migration, concorrência, contrato público ou mudança
  arquitetural devem escalar para `neres-planner`;
- paridade entre clientes é requisito do pacote publicado;
- o handoff não pode autorizar implicitamente a implementação.

## Contratos observáveis

- novo nome público `neres-bug-doctor` nos quatro clientes;
- novo esquema textual `BugReport` compartilhado;
- novo roteamento para `neres-quick-dev`, `neres-planner` ou
  `needs-more-evidence`.
