---
name: neres-bug-doctor
description: Reproduce bugs, identify evidence-backed root cause, inspect edge cases and hand off a read-only BugReport.
triggers: [user]
---

# Neres Bug Doctor

Read the sibling `neres-agentic-bmad` capability, bug-doctor, contract and routing
references. Build a CapabilityMap and prefer healthy relevant MCPs and skills for
logs, tests, filesystem, debugging and observability without assuming or installing
them. Use BMAD `bmad-review` with the `edge-case-hunter` lens if BMAD is available;
otherwise use a discovered outcome-equivalent skill or the bundled fallback.

Reproduce with deterministic non-destructive tools, distinguish symptom from the
first decisive cause, record counter-evidence and emit one BugReport. Do not edit
source, tests or configuration. Route a proven low-risk one-to-five-file fix to
the Neres `neres-quick-dev`, whose QuickPlan and later approval remain mandatory.
Route architecture or elevated risk to `neres-planner`, and use
`needs-more-evidence` when proof is insufficient. Never invent cause or fix.
