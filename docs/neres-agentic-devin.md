# Neres Agentic no Devin CLI/Desktop

Para exemplos completos de Devin CLI e Desktop, consulte o
[guia de uso por cliente](../skills/neres-agentic-bmad/docs/USAGE.md).

## Escopo

O bundle Devin oferece três entry skills, uma skill de protocolo e onze custom
subagents. Ele foi desenhado para uso em repositórios de trabalho e não pressupõe
os modelos, skills, MCPs ou políticas do ambiente pessoal do autor.

## Instalação por projeto

Na raiz do repositório de trabalho:

```powershell
node <NeresArmy>\skills\neres-agentic-bmad\scripts\install-devin.mjs --target project --destination-root . --dry-run
node <NeresArmy>\skills\neres-agentic-bmad\scripts\install-devin.mjs --target project --destination-root .
```

Esse modo escreve somente quatro diretórios em `.agents/skills` e onze arquivos em
`.agents/agents`. É o modo recomendado para compartilhar o fluxo com a equipe e com
sessões Desktop/cloud associadas ao repositório.

## Instalação por usuário

```powershell
node <NeresArmy>\skills\neres-agentic-bmad\scripts\install-devin.mjs --target user --dry-run
node <NeresArmy>\skills\neres-agentic-bmad\scripts\install-devin.mjs --target user
```

No Windows, o destino padrão é `%APPDATA%\devin`. Use `--destination-root` para um
root explícito. O instalador não altera `config.json`, `mcp_config.json`,
credenciais, políticas da organização ou assets não gerenciados. `--force` cria
backup antes de substituir somente os quinze destinos gerenciados.

## Entry points

- `/neres-planner`: intake, planejamento proporcional e TaskPackets.
- `/neres-developer`: implementação de story/spec e TaskPackets prontos.
- `/neres-quick-dev`: mudança local pequena; para após QuickPlan até autorização.

O Devin permite uma skill ativa por vez. Cada entry point lê o protocolo
`neres-agentic-bmad` versionado no mesmo bundle e chama skills equivalentes quando
uma delas cobrir integralmente a fase atual.

## Neutralidade e routing

Os entry points não fixam modelo e preservam o modelo selecionado pelo usuário ou
pelo Adaptive Devin. Os subagents usam aliases estáveis:

| Trabalho | Alias default | Motivo |
| --- | --- | --- |
| Leitura, escrita, crítica, coding, testes e QA | `swe` | Família SWE mais recente disponível na conta |
| Arquitetura, segurança e auditoria final | `opus` | Escalação de raciocínio e revisão |

Antes de executar, consulte `devin models list --format json`. SWE 1.7, SWE 1.6,
Claude até Opus 5, Kimi, GLM, DeepSeek Pro v4, MiMo ou qualquer outro modelo são
candidatos somente quando o inventário atual da conta trouxer o ID ou alias aceito.
Disponibilidade promocional não é assumida nem persistida no bundle.

## Skills e MCPs

O planner monta um `CapabilityMap` com as skills, MCPs e ferramentas locais realmente
disponíveis. Se BMAD existir, ele pode ser usado. Se não existir, o agente seleciona
skills equivalentes pelo resultado esperado, por exemplo planejamento, testes
unitários, E2E, filesystem, review ou segurança. O protocolo interno cobre apenas as
lacunas restantes.

Um MCP saudável e autoritativo é preferido para o sistema que ele representa. Isso
não autoriza instalar, autenticar, habilitar ou ampliar permissões. MCPs de escrita
começam em modo de leitura e qualquer mutação continua limitada pelo TaskPacket e
pelas aprovações normais do Devin.

## Validação na máquina de trabalho

```powershell
devin --version
devin models list --format json
devin skills list
devin mcp list
node <NeresArmy>\skills\neres-agentic-bmad\scripts\validate-devin-bundle.mjs
```

Depois da instalação por projeto, confirme que as quatro skills e os onze agents
aparecem e rode um smoke seguro em repositório temporário. Este pacote foi validado
estaticamente com fixture; o smoke real depende do Devin autenticado da empresa.
