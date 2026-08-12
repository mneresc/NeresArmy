# Capability discovery

Build a `CapabilityMap` before choosing workflows or tools:

```yaml
CapabilityMap:
  skills: [{name: <name>, outcome: <outcome>, scope: <scope>}]
  mcps: [{name: <name>, status: <healthy|unavailable|unknown>, authority: <source>, mutation: <read|write|mixed>}]
  deterministic_tools: [<test/search/build/filesystem tools>]
  unavailable: [<capability and reason>]
```

Discover the current runtime's skill catalog and MCP/tool inventory. Prefer a
healthy authoritative MCP for the remote or structured system it owns, and prefer
a repository skill for a documented procedure such as unit tests, E2E, filesystem
work, review or deployment. Use deterministic local search, diff, test, lint,
typecheck and build commands when they remain the direct source of evidence; a
suitable filesystem/test MCP may replace them when equally authoritative and
properly scoped.

BMAD remains mandatory for the Codex and OpenCode variants. Use other discovered
skills only to support a BMAD phase, such as unit tests, E2E, filesystem work or
review. Never assume a personal MCP, provider or skill exists. Do not install,
authenticate, enable or broaden a capability without explicit authorization.
Default mixed/write MCPs to read operations and require TaskPacket scope plus
normal approval to mutate.
