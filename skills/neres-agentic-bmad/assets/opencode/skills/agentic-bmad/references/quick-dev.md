# Quick-dev protocol

Use only for a tiny/small local low-risk change affecting one to five expected
files without architectural or public-contract impact. Otherwise return
`ESCALATE_TO_NERES_PLANNER` with the reason.

## Phase 1 — mandatory stop

1. Ask `dev-nerinhos-subagent-reader` for a local ContextPack.
2. Build a QuickPlan with classification, decisive diagnosis, inspected and
   expected files, implementation steps, verification, scope and risks.
3. End with `Plano pronto. Aguardando autorização para implementar.`
4. Do not edit source, tests or configuration.

## Phase 2 — later explicit approval only

Convert the approved QuickPlan into one to three TaskPackets. Reuse the Dev reader,
mechanical/coder, test and QA roles. If scope or risk grows, stop and request a new
decision. A `BugReport` from `neres-bug-doctor` supplies evidence but never skips
the QuickPlan or its approval gate.
