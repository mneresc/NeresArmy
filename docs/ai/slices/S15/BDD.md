# BDD — S15

## Bundle validation

Given the checked-in Devin assets and a model inventory containing SWE and Opus,
when the validator runs, then it accepts exactly four skills and eleven subagents.

Given an inventory without an Opus-family model, when validation runs, then it
reports the unavailable required family without inventing a replacement.

## Capability discovery

Given a work repository with arbitrary installed skills and MCPs, when an entry
skill starts, then it discovers current capabilities, selects only relevant healthy
ones and never assumes a named personal server or skill exists.

Given BMAD is absent but equivalent planning/testing skills exist, when planning or
development begins, then the agent maps outcomes to those skills and uses the
bundled fallback only for uncovered stages.

## Installation

Given an empty temporary project, when project dry-run executes, then no file is
written and all managed `.agents` targets are reported.

Given an existing managed target, when install runs without force, then it refuses;
when force is explicit, then it backs up and replaces only managed targets.

Given unrelated config and MCP files, when either install target executes, then
their bytes remain unchanged.

## Quick development

Given a small low-risk change and no later authorization, when quick-dev is invoked,
then it produces a QuickPlan and stops without editing.
