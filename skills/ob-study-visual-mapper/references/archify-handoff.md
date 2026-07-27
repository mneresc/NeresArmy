# Optional Archify handoff

Use Archify only when its installed interface is discoverable and the dominant
technical structure is architecture, workflow, sequence, data flow, lifecycle/state,
infrastructure topology, or pipeline.

Do not vendor Archify or guess its current schema. Read the installed Archify
`SKILL.md`, relevant schema, and one current example before producing input.

## Handoff contract

Complete source inspection, proposition extraction, relation normalization, and
Visual Map IR first. Pass only:

- selected diagram type and question answered;
- nodes/stages/states/components;
- directed relationships and labels;
- actors, decisions, inputs, outputs, deadlines, and boundaries;
- source evidence and uncertainty;
- layout intent and main path;
- facts/inferences the renderer must not invent.

Keep the source notes authoritative. Record the handoff and actual result in the
manifest.

## Composition

Generate the Archify artifact in the format currently supported by the installed
skill. Also generate a JSON Canvas index that links sources, summarizes the main
process, and links the Archify output when possible.

Validate Archify with its bundled commands. Do not report success from file existence
alone.

## Fallback

When Archify is absent, unsupported, fails, or cannot be validated:

1. Set manifest status to `fallback` or `failed`.
2. Render the topology as the best readable JSON Canvas process/architecture map.
3. Report the reason without pretending Archify ran.
4. Finish the task; never abort solely because Archify is unavailable.
