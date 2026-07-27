# Synthetic examples and evaluation scenarios

All content below is synthetic and demonstrates structure only. Do not reuse it as a
factual source.

## AFO

Input concepts: `PPA`, `LDO`, `LOA`, fiscal targets, budget guidelines, annual
budget, general rule, exception.

Expected properties:

- use a concept map with named edges;
- preserve any condition attached to the general rule;
- keep the exception linked to the exact rule it limits;
- create source references for nodes and edges;
- in recall, hide a high-value relationship or exception, not random words.

## Administrative process

Input concepts: authority, competence, request, decision, deadline, general rule,
exception, appeal.

Expected properties:

- use process when sequence dominates or competency when jurisdiction dominates;
- distinguish actors from actions/documents;
- attach the deadline to its trigger;
- preserve alternative route and exception;
- consider Archify only when a branching technical-style workflow materially helps.

## Information technology

Input concepts: client, API gateway, service, queue, worker, database, retry state.

Expected properties:

- route to architecture, sequence, data flow, or lifecycle according to the question;
- choose Archify when installed and validated;
- otherwise create a usable Canvas with a main path and short side branches;
- never invent a service or connection;
- record `fallback` honestly.

## Mathematics/statistics

Input concepts: synthetic formula `Z = (X - μ) / σ`, variables, assumption `σ > 0`,
prerequisite definitions, and common confusion between parameter and observation.

Expected properties:

- use formula dependency;
- preserve notation and the assumption;
- connect each variable with a precise dependency label;
- mark the confusion dimension;
- in recall, hide one dependency or assumption while retaining retrieval anchors.

## Manual evaluation prompts

1. “Create concept-map study and recall canvases from this AFO note.”
2. “Analyze these legislative-process notes and choose the best diagram.”
3. “Compare two similar administrative-law institutions by common dimensions.”
4. “Create a dependency map from these probability notes.”
5. “Update the existing Canvas without moving unchanged nodes.”
6. “Map this event-driven architecture and use Archify only if it helps.”

For every evaluation, require valid Canvas, labeled semantic edges, source coverage,
preserved exceptions/qualifiers, deterministic recall, honest integration status,
and no unsupported inference.
