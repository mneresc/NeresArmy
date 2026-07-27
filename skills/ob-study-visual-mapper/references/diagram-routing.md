# Diagram routing

Choose the representation that answers the retrieval task. Use concept map when
signals are mixed or uncertain.

| Intent | Use when | Avoid when |
| --- | --- | --- |
| `concept-map` | Definitions, rules, exceptions, dependencies, cross-links | A single ordering or comparison dominates |
| `classification` | Genre → category → species → subtype | Multiple parents or important lateral links exist |
| `process` | Ordered stages, decisions, routes, actors, deadlines | Order is incidental |
| `lifecycle` | Explicit states and transitions | Content describes actions without states |
| `comparison` | Similar institutions must be distinguished by common dimensions | There is no shared dimension |
| `timeline` | Dates, periods, deadlines, milestones are essential | Chronology does not explain the topic |
| `competency` | Authorities, responsibilities, jurisdiction, oversight | Actors are incidental |
| `exception-map` | Rule, condition, exception, exception to exception, consequence | Exceptions are minor |
| `formula-dependency` | Formulas depend on variables, assumptions, prerequisites | The task is procedural calculation |
| `architecture` | Components, boundaries, request/data flow, protocols | The material is conceptual rather than technical topology |

## Archify decision

Consider Archify only for `process`, `lifecycle`, `architecture`, `sequence`, and
`data-flow` when it materially improves a technical topology. Load
[archify-handoff.md](archify-handoff.md). Keep JSON Canvas mandatory.

Do not use Archify for legal rule/exception, classification, comparison, competency,
formula dependency, compact revision, or direct Obsidian navigation.

## sequential-thinking decision

Suggest or use the optional MCP when routing has competing plausible intents, dense
exception nesting, contradictory evidence, or a decision that should be revised after
testing assumptions. Load [sequential-thinking.md](sequential-thinking.md).

Do not use it for a straightforward small map. Its reasoning never substitutes for
source evidence.

## Split strategy

Use a conservative default of 40 nodes per Canvas. Before reaching an unreadable
layout:

1. Create an index Canvas.
2. Create focused child canvases by stable conceptual boundary.
3. Link index to children and children back to index/source.
4. Keep cross-topic relationships at the most useful level.
5. Record deferred propositions in the manifest.
6. Never drop facts only to satisfy the limit.
