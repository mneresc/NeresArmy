# Obsidian Study Visual Mapper

`ob-study-visual-mapper` é uma **Agent Skill para Obsidian**. Ela transforma notas
Markdown autorizadas em mapas de estudo e recuperação ativa no formato JSON Canvas,
com relações nomeadas, links para as fontes, manifest de proveniência e atualização
segura.

Não é plugin do Obsidian. A skill roda no agente compatível, grava `.canvas` no
destino escolhido e não exige que o Obsidian esteja aberto.

## O que produz

- `Tema.study.canvas`: mapa completo para compreensão e revisão.
- `Tema.recall.canvas`: mapa com relações de alto valor ocultadas como perguntas.
- `Tema.visual-map.json`: fontes, hashes, cobertura, IDs semânticos, ambiguidades e
  status de validação.
- Canvas índice e mapas filhos quando o tema é denso.
- Artefato Archify opcional para arquitetura, sequência, workflow, data flow ou
  lifecycle, sempre com fallback JSON Canvas.

## Instalação

```powershell
npx skills@latest add mneresc/NeresArmy --skill ob-study-visual-mapper
```

Também é possível instalar pela pasta pública:

```powershell
npx skills@latest add https://github.com/mneresc/NeresArmy/tree/main/skills/ob-study-visual-mapper
```

## Uso

```text
Use $ob-study-visual-mapper para criar mapas study e recall desta nota do Obsidian.
```

```text
Use $ob-study-visual-mapper para mapear esta pasta, dividir temas densos e preservar
as exceções e os links para as fontes.
```

```text
Use $ob-study-visual-mapper para atualizar este Canvas sem mover nós inalterados.
```

## JSON Canvas

JSON Canvas 1.0 é a saída primária. O Canvas contém apenas `nodes` e `edges` no
top-level; proveniência e metadata ficam no manifest separado. Relações sem label,
IDs duplicados, edges pendentes, geometria inválida, sobreposição e referências
factuais sem fonte bloqueiam a entrega.

## Archify e sequential-thinking

Archify é opcional e só melhora topologias técnicas de processo, sequência,
arquitetura, pipeline ou estados. Sem Archify, a skill conclui o trabalho em Canvas.

Para análises densas com hipóteses concorrentes, a skill sugere opcionalmente o MCP
oficial `sequential-thinking`. No Codex:

```powershell
codex mcp add sequential-thinking npx -y @modelcontextprotocol/server-sequential-thinking
```

O MCP organiza revisão e ramificação do raciocínio; não vira fonte factual e não é
necessário para instalar ou usar a skill.

## Validação

Na pasta da skill:

```powershell
python scripts/validate_canvas.py "Tema.study.canvas" --manifest "Tema.visual-map.json" --strict
python scripts/validate_manifest.py "Tema.visual-map.json" --canvas "Tema.study.canvas"
python scripts/test_visual_map.py
```

Adicione `--json` aos validadores para consumir diagnósticos por automação.

## Atualização segura

IDs derivam da identidade semântica. Uma atualização preserva posições de elementos
inalterados, mantém conteúdo manual sem proveniência gerada e sinaliza conflitos.
Quando a origem de um elemento é incerta, a skill cria backup ou recusa overwrite
destrutivo.

## Privacidade

- Trate o vault como fonte fechada.
- Não faça upload de notas por padrão.
- Não siga URLs externas sem pedido explícito.
- Não adicione telemetria ou analytics.
- Grave somente nos caminhos escolhidos pelo usuário.
- Considere os Canvas gerados tão sensíveis quanto as notas originais.

## Limitações conhecidas

A interpretação semântica continua sendo responsabilidade do agente e precisa de
evidência. O layout heurístico é determinístico, mas temas grandes devem ser divididos.
O validador detecta sobreposição e limites de grupo, porém não garante ausência de
todas as possíveis interseções visuais de edges.

Veja [o cookbook](docs/COOKBOOK.md) para receitas e solução de problemas.
