---
name: neres-agentic-bmad
description: Shared BMAD-first execution protocol for Neres Claude Code agents, capability discovery, compact handoffs, deterministic gates and audit.
---

# Neres Agentic BMAD for Claude Code

## Core rules

1. Build a CapabilityMap. Treat installed BMAD skills and their artifacts as the
   planning source of truth. Supporting skills and MCPs may accelerate a phase but
   do not replace or weaken the BMAD flow.
2. Use the cheapest model that can reliably complete the bounded task. Spend strong
   reasoning to make later execution cheaper.
3. Use T0 tools for search, tests, lint, typecheck, build, coverage, formatting and
   diffs. Never simulate a deterministic command with an LLM.
4. Protect the parent context. Exchange ContextPack, TaskPacket and compact reports;
   do not forward full files, raw logs, complete histories or hidden reasoning.
5. Respect `AGENTS.md`, repository-local instructions, public contracts and the
   TaskPacket file boundary. Return `NEEDS_ESCALATION` instead of improvising.
6. Parallelize independent read-only work. Parallelize writes only when files,
   contracts and dependencies do not overlap.
7. After REWORK, create corrective TaskPackets only for demonstrated gaps.

## Load only what is needed

- Read [planning.md](references/planning.md) for sizing, BMAD routing and planning.
- Read [capabilities.md](references/capabilities.md) before choosing skills, MCPs
  or deterministic tools.
- Read [bug-doctor.md](references/bug-doctor.md) for read-only reproduction,
  BugReport and routing.
- Read [development.md](references/development.md) for implementation and gates.
- Read [quick-dev.md](references/quick-dev.md) for the mandatory two-phase quick flow.
- Read [contracts.md](references/contracts.md) before producing or consuming a
  ContextPack, TaskPacket or report.
- Read [routing.md](references/routing.md) when choosing or escalating a model.
- Read [security.md](references/security.md) only when security triggers are present.
- Read [observability.md](references/observability.md) only when recording run data.

## Completion

Do not claim completion until acceptance evidence, deterministic verification, QA and
auditor coverage are available. Report real limitations and external blockers.

Claude Code entry agents may delegate only to their declared Agent allowlists. Subagents cannot delegate further. Preserve settings.json, .mcp.json, credentials and organization policy.
