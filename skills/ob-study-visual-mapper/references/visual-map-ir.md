# Visual Map IR and manifest

Build a renderer-neutral object before Canvas or Archify:

```json
{
  "schemaVersion": "visual-map/v1",
  "title": "Topic",
  "language": "pt-BR",
  "intent": "concept-map",
  "sources": [],
  "nodes": [],
  "edges": [],
  "groups": [],
  "layout": {},
  "recall": {},
  "archify": {},
  "warnings": []
}
```

## Nodes

Require `semanticKey`, `label`, `kind`, `importance`, `sourceReferences`, and
`recallPriority`. Allow `summary`, `groupId`, and `layoutHints`.

Make `semanticKey` stable from normalized scope plus concept identity. Do not use
array position. Mark navigation-only nodes as synthetic.

## Edges

Require `semanticKey`, `from`, `to`, `relationType`, `displayLabel`, `direction`,
`sourceReferences`, `confidence`, and `recallPriority`. Preserve `qualifiers` when
conditions, negation, deadlines, limits, or scope affect the relationship.

## Stable Canvas IDs

Derive lowercase 16-character hexadecimal IDs:

```text
sha256(scope + elementType + semanticKey).slice(0, 16)
```

Resolve any collision deterministically by adding a stable suffix to the semantic
key before hashing. Keep the same ID while semantic identity remains unchanged.

## Sidecar manifest

Write `<Topic>.visual-map.json` with:

- `schemaVersion: visual-map-manifest/v1`;
- Canvas path and source files with SHA-256;
- heading/block scope;
- diagram intent and generator/skill version;
- node/edge source mappings;
- stable semantic IDs;
- coverage classifications and omitted propositions;
- unresolved ambiguities and validation warnings;
- Archify and sequential-thinking status;
- generated/manual provenance needed for update.

Avoid timestamps in deterministic fixtures. When real timestamps are useful, keep
them optional and outside semantic equality.

The manifest must answer where each fact came from, which important facts were not
visualized, whether an element is generated/manual, and whether update is safe.

Use [../assets/schemas/visual-map.schema.json](../assets/schemas/visual-map.schema.json)
and
[../assets/schemas/visual-map-manifest.schema.json](../assets/schemas/visual-map-manifest.schema.json)
as machine-readable contracts.
