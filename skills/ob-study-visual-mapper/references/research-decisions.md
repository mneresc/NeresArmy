# Research and decision record

Accessed on 2026-07-27. Prefer the linked primary sources over this summary when
their contracts change.

| Source | Relevant rule | Decision | Class |
| --- | --- | --- | --- |
| [OpenAI skill-creator](https://github.com/openai/skills/blob/main/skills/.system/skill-creator/SKILL.md) | Keep `SKILL.md` concise, trigger through description, use progressive disclosure, validate the skill | Keep core workflow in `SKILL.md`; place detail in direct references; add generated-style `agents/openai.yaml` | Normative for Codex |
| [Agent Skills specification](https://agentskills.io/specification) | A skill is a directory with `SKILL.md`; name/description drive discovery; optional resources are relative | Keep canonical portable folder and avoid agent-specific logic in instructions | Normative open format |
| [JSON Canvas 1.0](https://jsoncanvas.org/spec/1.0/) | Top-level nodes/edges; four node types; defined edge sides/endpoints and colors | Keep provenance outside Canvas; reject unsupported fields and invalid references | Normative output format |
| [kepano json-canvas skill](https://github.com/kepano/obsidian-skills/tree/main/skills/json-canvas) | Use valid node/edge fields, 16-char hex IDs, grid spacing, source file nodes, and validation | Adapt authoring guidance; use semantic deterministic IDs instead of random IDs for safe regeneration | Reference implementation preference |
| [Archify](https://github.com/tt-a1i/archify) | Specialized validated renderers cover architecture, workflow, sequence, data flow, and lifecycle | Compose only after semantic IR; keep optional; never vendor; always provide Canvas fallback/index | Integration preference |
| [Sequential Thinking MCP](https://github.com/modelcontextprotocol/servers/tree/main/src/sequentialthinking) | Supports revision, branching, dynamic thought count, and hypothesis testing | Suggest it for ambiguous/dense routing; never require it or treat its reasoning as evidence | Optional tool preference |
| [NeresArmy creating skills](../../../docs/CREATING-SKILLS.md) | Require README, cookbook, catalog metadata, validation, and optional Codex metadata | Include repository-specific documentation even though portable skill guidance minimizes extra files | Repository-specific |

## License and attribution

Use specifications and external skills as design references only. Do not copy their
implementations or large instruction passages. The bundled code and documentation in
this skill are original to NeresArmy and inherit the repository MIT license.
