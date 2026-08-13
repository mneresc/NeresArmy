# Bug Doctor protocol

`neres-bug-doctor` is a read-only diagnostic entry point. Build the shared
CapabilityMap, reproduce with deterministic non-destructive commands, distinguish
the first decisive cause from downstream symptoms and record counter-evidence.
Use `bmad-review` with only the `edge-case-hunter` lens when available; the lens
challenges boundaries but never substitutes for root-cause evidence.

Do not edit source, tests, configuration or generated artifacts. Suggest a fix but
emit only this compact handoff and stop:

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

Use `neres-quick-dev` only for a confirmed, low-risk, local one-to-five-file fix
without architecture or public-contract impact. It must still create a QuickPlan
and stop for later explicit authorization. Use `neres-planner` for security, auth,
database, migration, concurrency, public contracts, architecture or cross-cutting
risk. Use `needs-more-evidence` when reproduction or decisive evidence is absent;
never invent cause or fix.
