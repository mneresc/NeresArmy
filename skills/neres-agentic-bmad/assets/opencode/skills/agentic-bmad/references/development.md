# Development protocol

## Understand, decompose, delegate, verify

1. Validate TaskPacket dependencies and file boundaries.
2. Ask reader for local ContextPack; do not reread the project broadly.
3. Use mechanical for prescribed repetitive edits; use coder for bounded reasoning.
4. Stop a worker that requests forbidden files, contract reinterpretation or
   architecture change. Return to the primary with `NEEDS_ESCALATION`.
5. Run T0 gates with the test subagent. Preserve decisive output only.
6. Run QA for every non-trivial code change. Run security only on security triggers.
7. Give auditor only OriginalRequest, relevant BMAD artifact, TaskPackets,
   TaskReports, diff, TestReport, QAReport and optional SecurityReport.
8. On REWORK, issue corrective TaskPackets for matrix gaps only.

## Parallelization

Parallelize independent readers, QA/security and documentation verification. Write in
parallel only when TaskPackets have disjoint files, contracts and dependencies. Never
run two writers in the same component or public contract.

## Deterministic gates

Use repository commands discovered from local instructions. Prefer focused tests
first, then required lint/typecheck/build/integration checks. A passing test suite is
evidence, not proof that acceptance and scope are complete.
