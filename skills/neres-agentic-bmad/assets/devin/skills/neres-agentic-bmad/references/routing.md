# Devin model routing

Start with `devin models list --format json` in CLI or the current Desktop model
selector. Organization policy and actual inventory win over this guidance.

- `swe` is the stable alias for the latest Cognition SWE family. Use it for
  reading, routine coding, mechanical edits, tests and normal QA.
- `opus` is the stable alias for the latest Claude Opus family. Use it for
  architecture and demonstrated high-risk security/audit work.
- Adaptive/current parent model is suitable for entry orchestration.
- Kimi, GLM, DeepSeek and MiMo are neutral runtime candidates when their exact IDs
  are present: evaluate task fit, context, latency, cost and organization policy
  before a session override. Do not invent their slugs.

Temporary free periods or discounts, including an SWE promotion ending on a day
16, are live account facts—not durable routing rules. Verify them at execution time
and never sacrifice correctness or company policy for a promotion.

Escalate model strength only for demonstrated complexity or failed bounded
attempts. Do not fan out premium subagents without independent work that justifies
their separate cost.
