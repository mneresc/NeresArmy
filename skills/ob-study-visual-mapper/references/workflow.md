# Semantic workflow and source fidelity

## Inspect

Record the authorized root, selected files, heading/block scope, output directory,
mode, density, node limit, and integration preference. Reject a source/output alias.
Ignore `.canvas`, manifests, generated indexes, answer keys, duplicate summaries, and
navigation unless the user selects them as source.

Recognize Obsidian frontmatter, headings, lists, tables, callouts, block IDs,
wikilinks, aliases, embeds, tags, fenced code, math, internal links, and attachments.
Do not leave the authorized boundary to resolve a link.

## Extract atomic propositions

Represent each claim with:

- subject, predicate, and object;
- condition, exception, scope, deadline, limit, modality, and negation;
- authority or actor where relevant;
- source path plus heading, block, line range, or exact excerpt;
- confidence: `explicit`, `supported`, `ambiguous`, or `unresolved`.

Never reduce “X applies only when Y, except Z” to “X applies”. Keep each qualifier
attached to the proposition it controls.

## Normalize concepts

Identify central/supporting concepts, rules, exceptions, conditions, procedures,
actors, authorities, documents, stages, states, deadlines, limits, formulas,
variables, examples, counterexamples, and common confusions.

Merge aliases only when identity is evidenced. Keep legally or technically distinct
concepts separate even if their labels are similar.

## Extract relationships

For every edge, record source concept, target concept, normalized relation type,
natural-language label, direction, source evidence, confidence, and qualifiers.
Do not connect terms merely because they appear nearby.

Load [relation-ontology.md](relation-ontology.md) before normalizing edge types.

## Rank and route

Prioritize centrality, exam relevance, dependency, frequency of confusion,
exception status, numbers, deadlines, and ability to retrieve a larger structure.
Do not rank introductory prose above rules because it appears first.

Load [diagram-routing.md](diagram-routing.md), select the intent, and split dense
topics instead of dropping information.

## Build and render

Build the IR from [visual-map-ir.md](visual-map-ir.md). Generate stable semantic
keys before layout. Render with [json-canvas-authoring.md](json-canvas-authoring.md).
Only then apply recall or an optional Archify handoff.

## Track coverage

Classify every proposition as:

- `represented-directly`;
- `represented-through-parent`;
- `linked-to-source`;
- `deferred-to-child-canvas`;
- `omitted-duplication`;
- `omitted-low-value-exposition`;
- `unresolved`.

Scrutinize any omission containing an exception, negation, deadline, limit,
percentage, amount, jurisdiction, condition, prohibition, permission, scope, or
formula assumption. Put the classification and rationale in the manifest.

## Validate and report

Validate Canvas, manifest, overlap, density, source references, omission coverage,
recall leakage, and integration status. Report what was generated, routing rationale,
coverage, unresolved material, integrations actually used, fallback, and command
results.
