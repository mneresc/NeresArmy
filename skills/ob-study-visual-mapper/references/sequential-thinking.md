# Optional sequential-thinking MCP

Suggest the official `@modelcontextprotocol/server-sequential-thinking` MCP when the
analysis benefits from revising assumptions, branching alternatives, or testing a
hypothesis across several reasoning steps.

Useful cases:

- two diagram intents appear equally plausible;
- dense nested exceptions need a rule/condition/exception decomposition;
- source passages conflict and the agent must preserve alternatives;
- a large topic needs a defensible split strategy;
- an Archify versus Canvas decision changes after checking topology.

Avoid it for a small straightforward map. Never make it a prerequisite, and never
send notes to an unapproved remote service. The official reference server runs over
stdio locally when installed with npm.

## Codex suggestion

Offer, but do not execute without the user's authorization:

```text
codex mcp add sequential-thinking npx -y @modelcontextprotocol/server-sequential-thinking
```

On Windows clients that require an explicit shell, follow that client's current MCP
configuration guidance and use `cmd /c npx ...`.

## Use safely

1. State the decision being analyzed, not the entire vault.
2. Keep each thought tied to source IDs or explicit assumptions.
3. Branch only when alternatives matter.
4. Revise when evidence contradicts a prior assumption.
5. Return the chosen route plus rejected alternatives and uncertainty.
6. Do not expose private chain-of-thought in the final artifact; record only concise
   decisions, evidence, and unresolved ambiguity.
7. Continue directly when the tool is unavailable.

This MCP organizes analysis. It does not validate Canvas, supply missing facts, or
replace source references.
