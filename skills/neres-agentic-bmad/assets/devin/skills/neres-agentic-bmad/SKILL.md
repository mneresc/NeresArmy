---
name: neres-agentic-bmad
description: Shared Neres multi-agent execution protocol for Devin CLI/Desktop planning, implementation, quick development, bug diagnosis, capability discovery and compact handoffs.
triggers: [user, model]
---

# Neres Agentic BMAD for Devin

Build a `CapabilityMap` before choosing workflows or tools. Use BMAD only if it
is available; otherwise map installed skills to the required outcomes and use the
bundled proportional fallback for uncovered stages.

Read only the needed references:

- `references/capabilities.md` before selecting skills, MCPs or local tools.
- `references/bug-doctor.md` for read-only reproduction, BugReport and routing.
- `references/planning.md` for planning and fallback workflow selection.
- `references/development.md` for TaskPacket execution and gates.
- `references/quick-dev.md` for the mandatory two-phase quick flow.
- `references/contracts.md` before emitting or consuming compact handoffs.
- `references/routing.md` before selecting or escalating models.

Respect repository instructions, organization policy, least privilege and exact
TaskPacket boundaries. Do not install or authenticate an MCP, reveal secrets,
commit, push, merge or expand scope unless the user explicitly authorizes it.
