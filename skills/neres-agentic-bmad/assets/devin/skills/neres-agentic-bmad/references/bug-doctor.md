# Bug Doctor fallback and routing

Diagnose read-only. Build the CapabilityMap and prefer healthy relevant MCPs and
skills for logs, tests, filesystem, debugging and observability. Use BMAD
`bmad-review` with the `edge-case-hunter` lens when available; otherwise use a
discovered outcome-equivalent review capability or this bundled boundary check.
Neither path proves root cause without decisive evidence.

Reproduce, trace the first decisive divergence, record counter-evidence, inspect
adjacent boundaries, suggest the smallest fix and emit a `BugReport` without
editing source, tests or configuration:

```yaml
BugReport:
  symptom: <observed failure>
  expected_behavior: <public behavior>
  actual_behavior: <public behavior>
  reproduction: {status: reproduced | intermittent | not-reproduced, steps: []}
  evidence: []
  root_cause: {finding: <decisive cause or unknown>, confidence: high | medium | low}
  affected_files: []
  edge_cases: []
  proposed_fix: <bounded suggestion or unknown>
  regression_tests: []
  routing:
    destination: neres-quick-dev | neres-planner | needs-more-evidence
    reason: <evidence-backed reason>
```

Use `neres-quick-dev` only for a confirmed low-risk one-to-five-file local fix;
its QuickPlan and later approval remain mandatory. Use `neres-planner` for
security, auth, database, migration, concurrency, public contract, architecture
or cross-cutting risk. Use `needs-more-evidence` when proof is insufficient.
