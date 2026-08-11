# Development protocol

1. Build or refresh the CapabilityMap and validate TaskPacket dependencies.
2. Ask the reader for local context instead of rereading the repository broadly.
3. Use a relevant installed implementation/testing skill when discovered; use
   mechanical or coder for the remaining bounded work.
4. Prefer healthy scoped MCPs for the systems they authoritatively represent.
5. Run deterministic focused tests, then repository-required lint, typecheck,
   build, integration or UI gates. Preserve decisive output only.
6. Require QA for non-trivial code. Run security only for security triggers.
7. Audit request-to-acceptance-to-diff-to-test coverage and return PASS or REWORK.

Stop with `NEEDS_ESCALATION` for forbidden files, contract reinterpretation,
architecture growth, missing authorization or two failed attempts. Never weaken a
RED test, commit, push, merge, read secrets or perform destructive cleanup.
