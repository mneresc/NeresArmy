# Model tiers and escalation

## Tiers

| Tier | Default | Use |
| --- | --- | --- |
| T0 | no LLM | tests, search, lint, typecheck, build, diff, formatting |
| T1 | `opencode-go/deepseek-v4-flash` | reading, summaries, logs, mechanical work, test orchestration |
| T2 | `opencode-go/deepseek-v4-pro` | routine orchestration, normal review, critique, QA, normal security |
| T3 | `opencode-go/kimi-k2.7-code` | bounded coding and refactoring |
| T4 | `opencode-go/glm-5.2` | document writing, architecture, hard diagnosis, audit |

Fallback candidates, only after verifying `opencode models`:

- T1: `opencode-go/mimo-v2.5`.
- T2: `opencode-go/mimo-v2.5-pro` or `opencode-go/qwen3.7-plus`.
- T3: `opencode-go/deepseek-v4-pro`.
- T4 exceptional session override: `opencode-go/kimi-k3`, with
  `opencode-go/grok-4.5` or `opencode-go/qwen3.8-max` as evaluated alternatives.

Do not create an agent merely to use GLM-5.1, Kimi K2.6, MiniMax, Qwen Max/Plus,
MiMo Pro, Grok or Hy3. Re-evaluate them only with measured task evidence.

## Escalate

Escalate after two unsuccessful attempts, persistent test failure without cause,
required file outside allowed_files, contradiction, insufficient TaskPacket,
unplanned architecture, risk increase, complex concurrency, critical security,
distributed transaction, critical migration or implementation much larger than plan.

OpenCode agents have static configured models. Return T1/T2/T3 escalation to a
bounded GLM-5.2 architect/auditor pass or an explicit session override for
re-diagnosis/re-specification. Use Kimi K3 only through an explicit session model
override; never make it a default worker.
