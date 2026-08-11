# S14 BDD

## Scenario 1 — Validate native Codex bundle

Given the current Codex model inventory
When the bundle validator runs
Then it finds three profiles and eleven custom agents
And validates each model, reasoning effort, sandbox and required field.

## Scenario 2 — Reject unavailable routing

Given a required GPT-5.6 model is absent
When validation runs
Then installation fails before any write.

## Scenario 3 — Preserve user configuration

Given an existing `$CODEX_HOME/config.toml`
When the bundle is installed
Then its bytes remain unchanged
And existing agents, profiles, skills, MCPs and plugins outside managed names remain.

## Scenario 4 — Safe overwrite

Given a managed destination already exists
When installation runs without `--force`
Then it refuses to overwrite.

When it runs with `--force`
Then it backs up the previous destination before replacement.

## Scenario 5 — Planner isolation

Given a small planning request
When `neres-planner` delegates discovery
Then a Plan reader returns ContextPack
And the planner returns a TaskPacket without editing production.

## Scenario 6 — Developer orchestration

Given an approved TaskPacket
When `neres-developer` executes it
Then reader, bounded executor, deterministic test and QA are delegated
And only compact reports return to the parent.

## Scenario 7 — Quick-dev human gate

Given a low-risk localized request
When `neres-quick-dev` completes discovery
Then it emits QuickPlan and stops
And it does not edit source before explicit approval.
