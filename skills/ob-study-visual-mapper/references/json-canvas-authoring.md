# JSON Canvas authoring, layout, and update

Follow JSON Canvas 1.0. Put only `nodes` and `edges` at the top level.

## Nodes and edges

Use node types `text`, `file`, `link`, and `group`. Require `id`, `type`, integer
`x`, `y`, `width`, and `height`; add the type-specific `text`, `file`, or `url`.
Make dimensions positive. Use file paths relative to the vault with `/`; make
`subpath` start with `#`.

Require edge `id`, `fromNode`, and `toNode`. Use sides `top`, `right`, `bottom`,
`left` and endpoints `none`, `arrow`. Label every semantic edge with a precise verb
phrase.

Use preset colors `"1"`–`"6"` or six-digit hex. Apply color semantically and never
as the only cue.

## Content

Put one principal idea in each text node. Use a concise title, short rule/definition,
essential qualifier, and optional source cue. Avoid essays, decorative filler,
repeated headers, and fragments without retrieval value.

Use groups only for genuine conceptual clusters. Place group nodes earlier in the
array so z-index keeps children visible.

## Layout

Select the layout from intent: top-to-bottom or left-to-right hierarchy, grouped
columns, timeline, process lanes, dependency layers, or a restrained radial map.

- Leave at least 50–100 px between ordinary nodes.
- Align to a 10/20 px grid.
- Keep equivalent node kinds consistently sized.
- Choose a clear reading direction.
- Keep related concepts spatially close.
- Minimize crossings and edges through unrelated nodes.
- Choose anchors from relative position.
- Pad groups by 20–50 px.
- Allow negative coordinates when useful.
- Split a map instead of making it excessively wide/tall.

## Safe update

1. Match by semantic ID from the manifest.
2. Classify added, changed, removed, and unchanged elements.
3. Preserve coordinates/dimensions of unchanged elements.
4. Place additions near related elements without moving the whole map.
5. Remove an obsolete item only when provenance proves it was generated.
6. Retain manual nodes/annotations and report conflicts.
7. Back up or refuse destructive overwrite when provenance is uncertain.
8. Revalidate after merge.

## Validation

Run `scripts/validate_canvas.py` and `scripts/validate_manifest.py`. Block delivery
for parse errors, unsupported fields, duplicate IDs, missing fields, invalid
geometry/colors/paths/sides/endpoints, dangling/unlabeled edges, overlap, or factual
items without source references.

Review warnings for long nodes, density, and group-boundary crossings. The validator
does not prove semantic truth or every possible edge crossing; inspect those against
the source and Canvas layout.
