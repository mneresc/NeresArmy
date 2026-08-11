---
name: neres-quick-dev
description: Diagnose a tiny low-risk change, stop for human approval, then implement through bounded Devin subagents and verification.
triggers: [user]
---

# Neres Quick Dev

Read the sibling `neres-agentic-bmad` capability, quick-dev, contract and routing
references. Build a CapabilityMap. Use BMAD only if it is available and
proportionate; otherwise use discovered equivalent skills or the compact fallback.

Phase 1 must use the Dev reader, emit QuickPlan and stop without editing. Phase 2
starts only after a later explicit authorization. Then create one to three
TaskPackets, use relevant healthy MCPs/skills, run deterministic tests and QA, and
stop again if scope or risk grows.
