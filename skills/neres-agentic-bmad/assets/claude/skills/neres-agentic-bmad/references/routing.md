# Model tiers and escalation

## Tiers

| Tier | Default | Use |
| --- | --- | --- |
| T0 | no LLM | tests, search, lint, typecheck, build, diff, formatting |
| T1 | `opencode-go/muse-spark-1.3-contributor` | reading, summaries, logs, mechanical work, test orchestration |
| T2 | `opencode-go/muse-spark-1.3-contributor` | routine orchestration, normal review, critique, QA, normal security |
| T3 | `opencode-go/muse-spark-1.3-contributor` | bounded coding and refactoring |
| T4 | `opencode-go/glm-5.2` | document writing, architecture, hard diagnosis, audit |

Fallback candidates, only after verifying `opencode models`:

- T1: `opencode-go/mimo-v2.5`.
- T2: `opencode-go/mimo-v2.5-pro` or `opencode-go/qwen3.7-plus`.
- T3: `opencode-go/muse-spark-1.3-contributor` for a lower-cost retry before
  returning the task to the T4 architecture or audit gate.
- T4 exceptional session overrides must be selected from the live model inventory
  and justified by measured task evidence; no provider-specific route is predefined.

Do not create an agent merely to use another model family. Re-evaluate alternatives
only with measured task evidence.

## Escalate

Escalate after two unsuccessful attempts, persistent test failure without cause,
required file outside allowed_files, contradiction, insufficient TaskPacket,
unplanned architecture, risk increase, complex concurrency, critical security,
distributed transaction, critical migration or implementation much larger than plan.

OpenCode agents have static configured models. Return T1/T2/T3 escalation to a
bounded GLM-5.2 architect/auditor pass or an explicitly justified session override
for re-diagnosis/re-specification. Never pre-route escalation to a specific provider.
