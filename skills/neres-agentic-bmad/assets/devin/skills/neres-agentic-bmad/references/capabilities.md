# Capability discovery

## Build a CapabilityMap

Discover before choosing:

1. Read `AGENTS.md` and repository-local instructions.
2. In Devin CLI, inspect `devin skills list` and `devin mcp list`; inspect skill
   details only for relevant candidates. In Desktop/cloud, use the visible skill,
   integration and MCP tool catalogs instead of assuming CLI commands exist.
3. Record available capability, scope, health/auth state, authority, mutation risk
   and the task outcome it can satisfy.

```yaml
CapabilityMap:
  skills: [{name: <name>, outcome: <outcome>, scope: <repo|user|org>}]
  mcps: [{name: <name>, status: <healthy|unavailable|unknown>, authority: <source>, mutation: <read|write|mixed>}]
  deterministic_tools: [<test/search/build/filesystem tools>]
  unavailable: [<capability and reason>]
```

## Selection order

1. Prefer a healthy authoritative MCP for remote systems, structured repositories,
   logs, tickets, browser state or other data it owns.
2. Prefer a repository skill for a documented procedure, including unit, E2E,
   filesystem or review workflows discovered in the current environment.
3. Use deterministic local tools for code search, diffs, tests, lint, typecheck and
   build when they are the repository's direct source of evidence. A suitable
   filesystem or test MCP may replace them only when it is healthy, scoped and at
   least as authoritative.
4. Fall back to generic reasoning only when no suitable capability exists.

Do not name or require a personal MCP, provider or skill. Do not install, enable,
authenticate or broaden access merely because a capability would be convenient.
For mixed/write MCPs, use read operations by default and require TaskPacket scope
plus normal approval for mutations.

Devin supports one active skill at a time. Invoke an equivalent skill when it fully
owns the current phase; otherwise read its checked-in instructions as scoped
repository guidance and retain the Neres contracts.
