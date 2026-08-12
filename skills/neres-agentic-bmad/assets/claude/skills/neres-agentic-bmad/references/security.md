# Conditional security review

Run security review when a change touches authentication, authorization, IAM,
session, token, external input, upload, SQL, filesystem, commands, external URLs,
SSRF, secrets, cryptography, sensitive data, cloud permissions, infrastructure,
deserialization or security-related concurrency.

Inspect adversarially:

- trust boundaries, identity and ownership;
- validation, canonicalization and injection;
- least privilege and multi-tenant isolation;
- secrets/PII in code, logs and reports;
- unsafe filesystem, subprocess and network behavior;
- replay, race, expiry, rollback and failure modes.

Use DeepSeek V4 Pro for normal risk. Return `NEEDS_ESCALATION` to a GLM-5.2 auditor
or explicit session override for high risk. Require evidence and exploit/impact, not
generic checklists.
