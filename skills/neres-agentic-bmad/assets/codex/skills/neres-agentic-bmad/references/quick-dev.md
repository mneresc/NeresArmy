# Quick-dev protocol

## Eligibility

Use only when size is tiny/small, risk is low, scope is local, expected files are
one to five, architecture impact is none/minimal and no cross-cutting contract is
present. Otherwise return `ESCALATE_TO_NERES_PLANNER` with the reason.

## Phase 1 — mandatory stop

1. Ask `dev-nerinhos-subagent-reader` for a local ContextPack.
2. Classify eligibility and produce:

```yaml
classification: {type: small-local-change, risk: low, confidence: high}
diagnosis: <decisive cause>
files: {inspect: [], expected_changes: []}
implementation: []
verification: []
estimated_scope: {files: 0, architecture_change: false}
risks: []
```

3. End with `Plano pronto. Aguardando autorização para implementar.`
4. Do not edit source, tests or configuration in this phase.

## Phase 2 — only after later explicit approval

Convert QuickPlan into one to three TaskPackets. Reuse Dev reader,
mechanical/coder, test and QA. Use auditor only if risk or scope increased. If a
material change outside QuickPlan appears, stop and request a new decision.
