# Feature intake — S15 Devin port and capability neutrality

## Objective

Port Neres Agentic BMAD to Devin CLI/Desktop with three user-facing skills,
eleven custom subagents, safe project/user installers, adaptive model routing and
explicit discovery of available skills and MCPs. Update Codex/OpenCode behavior to
prefer suitable discovered capabilities without assuming personal infrastructure.

## Constraints

- Target use is a work environment; do not install Devin artifacts into this
  personal machine.
- Keep the Neres name, but keep models, skills, MCPs, repositories and providers
  organization-neutral.
- BMAD is preferred when actually present. Otherwise select installed equivalent
  skills by outcome; use the bundled proportional workflow only as fallback.
- Do not encode temporary promotional pricing or an unverified model slug.
- Do not edit Devin base config or MCP configuration.
- Preserve the uncommitted S14 Codex work and existing OpenCode behavior.

## Risks

- Devin custom subagents are experimental and their schema may evolve.
- Devin CLI is not installed on this machine, so live CLI/Desktop smoke requires
  the work environment.
- Cloud Devin supports repository skills, while custom subagent behavior is a
  Devin CLI/Desktop-local capability.

## Approval

The user's explicit instruction to do the same implementation for Devin is the
implementation approval for this bounded slice. No remote publication is implied.
