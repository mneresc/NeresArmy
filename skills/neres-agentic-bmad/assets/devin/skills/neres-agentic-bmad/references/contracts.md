# Compact handoff contracts

Use YAML-shaped text and never omit uncertainties, failures or scope violations.

```yaml
ContextPack:
  objective: <local question>
  relevant_files: [{path: <path>, reason: <why>}]
  symbols: [<symbol>]
  relevant_behavior: [<fact>]
  dependencies: [<dependency>]
  uncertainties: [<unknown>]
  snippets: [{file: <path>, lines: <start-end>, reason: <why>}]

TaskPacket:
  id: <stable id>
  title: <bounded change>
  goal: <observable result>
  why: <reason>
  context: [<paths or artifacts>]
  allowed_files: [<exact paths>]
  forbidden_files: [<exact paths>]
  known_facts: [<fact>]
  implementation_constraints: [<constraint>]
  acceptance: [<observable check>]
  verification: [<real command or trusted capability>]
  dependencies: [<packet ids>]
  parallel_group: <group or null>
  risk: low | medium | high
  recommended_tier: T1 | T2 | T3 | T4
```

Return `TaskReport`, `TestReport`, `QAReport`, optional `SecurityReport` and final
`AuditReport` using status, changed files, commands/evidence, findings, scope
violations, residual risks and escalation state. Never forward entire files, raw
logs or hidden reasoning when decisive excerpts suffice.
