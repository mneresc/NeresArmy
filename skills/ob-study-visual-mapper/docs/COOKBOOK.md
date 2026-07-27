# Cookbook — Obsidian Study Visual Mapper

Todas as receitas usam somente o escopo explicitamente autorizado. Substitua os
exemplos por caminhos relativos ao seu vault.

## Gerar de uma nota

```text
Use $ob-study-visual-mapper em "AFO/PPA LDO LOA.md". Crie Tema.study.canvas,
preserve qualificadores e inclua links para headings de origem.
```

## Gerar de uma pasta

```text
Mapeie "Direito Administrativo/Atos" com $ob-study-visual-mapper. Se ultrapassar
40 nós, crie Canvas índice e mapas filhos sem omitir exceções.
```

## Gerar apenas uma seção

```text
Mapeie somente "# Competência" de "Processo.md". Não leia outras seções nem backlinks.
```

## Criar study e recall

```text
Crie modos both com densidade recall medium. O study deve manter todas as respostas;
o recall deve ocultar relações, prazos e exceções de maior valor.
```

## Forçar comparação

```text
Use modo comparison para distinguir os dois institutos pelas mesmas dimensões.
Avise se a fonte não sustentar alguma dimensão.
```

## Gerar processo

```text
Use modo process. Preserve atores, decisões, prazos, eventos e rotas alternativas.
Considere Archify, mas entregue Canvas mesmo se ele não estiver instalado.
```

## Usar Archify quando disponível

```text
Detecte a skill Archify. Se o material for arquitetura, sequência, workflow, data
flow ou lifecycle e a composição melhorar a clareza, gere o handoff e um Canvas índice.
```

Se Archify falhar, registre `fallback` no manifest e finalize o processo em JSON
Canvas; não afirme que Archify foi usado.

## Sugerir sequential-thinking

```text
O tema possui exceções aninhadas e duas interpretações possíveis. Se o MCP
sequential-thinking estiver disponível, use revisão/branching para escolher o routing;
caso contrário continue diretamente e marque a ambiguidade.
```

Instalação opcional no Codex:

```powershell
codex mcp add sequential-thinking npx -y @modelcontextprotocol/server-sequential-thinking
```

## Atualizar um Canvas

```text
Use update com o Canvas e manifest existentes. Preserve IDs e posições inalterados,
adicione novos conceitos perto dos relacionados e não remova anotações manuais.
```

## Validar um Canvas

```powershell
python scripts/validate_canvas.py "Tema.study.canvas" --strict
```

Com manifest:

```powershell
python scripts/validate_canvas.py "Tema.study.canvas" --manifest "Tema.visual-map.json" --strict
```

## Reparar um Canvas

1. Rode com `--json`.
2. Corrija primeiro `invalid-json`, `duplicate-id` e `dangling-edge`.
3. Corrija fields, geometria, paths e labels.
4. Reposicione sobreposições e nós que cruzam grupos.
5. Complete source references factuais no manifest.
6. Rode o validador novamente até `valid: true`.

## Diagnóstico

### Edge sem label

Troque `relaciona-se a` por um verbo sustentado pela fonte, como `exige`, `limita`,
`precede`, `é exceção de` ou `depende de`.

### Canvas denso

Crie um índice, mova detalhes para mapas filhos e mantenha relações transversais no
nível mais útil. Não descarte regras para ficar abaixo do limite.

### Path inválido

Use path relativo ao vault e barras `/`: `Direito/AFO/Nota.md`. Não use drive,
path absoluto, URL, `..` ou barras `\` no Canvas.

### Recall entrega a resposta

Oculte a relação ou o conceito-alvo e remova pistas equivalentes de nós vizinhos.
Mantenha a resposta completa somente no study.

### Update ameaça conteúdo manual

Interrompa o overwrite. Exija manifest confiável, faça backup e reporte o conflito.
