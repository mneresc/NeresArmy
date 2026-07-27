# Active recall transformation

Create recall from a validated study IR, not independently from raw notes. Keep the
study map as the complete answer key.

## Rank prompts

Prioritize:

1. exceptions and exceptions to exceptions;
2. conditions, negation, scope, limits, deadlines, and jurisdiction;
3. sequence, triggers, state transitions, and consequences;
4. formula variables, assumptions, and prerequisites;
5. frequently confused distinctions;
6. high-centrality relations that reconstruct a larger structure.

Use a deterministic rank: explicit `recallPriority`, then semantic key.

## Density

- `light`/`low`: hide about 25% of eligible high-value relations;
- `medium`: hide about 50%;
- `high`: hide about 75%.

Hide at least one eligible relation when a recall map is requested. Never hide every
anchor or all facts in a cluster.

## Transformations

Prefer relational prompts:

- replace an edge label with `[qual relação?]`;
- hide the target exception, authority, condition, deadline, or consequence;
- ask for the next stage or transition trigger;
- present two concepts and ask for the distinguishing dimension;
- show a formula while hiding one dependency.

Do not blank random low-value words. Avoid leaking the answer through a nearby node,
duplicate edge, group label, source preview, or filename.

## Validation

Confirm that:

- the recall Canvas remains structurally valid;
- every prompt has an answer in the study map;
- hidden content is source-grounded;
- prompt selection is stable for the same IR and density;
- enough context remains to support retrieval;
- no answer is exposed nearby;
- coverage does not treat hidden recall content as omitted.
