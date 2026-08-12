# Compact handoff contracts

Use YAML-shaped text. Omit empty optional fields, but never omit uncertainty,
violations, failures or escalation state.

## ContextPack

```yaml
objective: <local question>
relevant_files:
  - path: <path>
    reason: <why>
symbols: [<symbol>]
relevant_behavior: [<observed fact>]
dependencies: [<dependency>]
uncertainties: [<unknown>]
snippets:
  - file: <path>
    lines: <start-end>
    reason: <why these lines>
```
Never include a whole file when a symbol region is sufficient.

## TaskPacket

```yaml
id: <stable id>
title: <bounded change>
goal: <observable result>
why: <business reason>
context: [<paths or artifact refs>]
allowed_files: [<exact paths>]
forbidden_files: [<exact paths>]
known_facts: [<facts already established>]
implementation_constraints: [<must/must not>]
acceptance: [<observable checks>]
verification: [<real commands>]
dependencies: [<TaskPacket ids>]
parallel_group: <group or null>
risk: low | medium | high
recommended_tier: T1 | T2 | T3 | T4
```

Cheaper workers require more explicit packets. Never send “improve X”. Provide file,
symbol, exact change, constraints, acceptance and commands.

## TaskReport

```yaml
task: <id>
status: completed | blocked | needs_escalation
changed_files: [<paths>]
summary: [<change>]
verification:
  <gate>: pass | fail | not_run
scope_violation: false
risks: [<residual risk>]
needs_escalation: false
```

## TestReport

```yaml
status: passed | failed | blocked
commands: [<command>]
passed: <count or unknown>
failed: <count or unknown>
failed_tests: [<names>]
relevant_error: <minimal decisive excerpt>
probable_files: [<paths>]
probable_symbols: [<symbols>]
raw_output_required: false
```

## QAReport

```yaml
status: pass | rework
acceptance_checked: [<criterion and evidence>]
findings:
  - severity: critical | high | medium | low
    evidence: <file/line or behavior>
    impact: <observable consequence>
missing_tests: [<behavior>]
scope_drift: [<path/change>]
```

## SecurityReport

```yaml
status: pass | rework | needs_escalation
risk_level: low | medium | high
attack_surfaces: [<surface>]
findings: [<severity, evidence, exploit/impact, remediation>]
assumptions: [<assumption>]
```

## AuditReport

```yaml
result: PASS | REWORK
matrix:
  - requirement: <id/text>
    implemented: yes | no | partial
    evidence: <path/line/report>
    tested: yes | no
corrective_taskpack_ids: [<id>]
residual_risks: [<risk>]
```
