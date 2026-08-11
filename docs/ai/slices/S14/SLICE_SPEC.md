# S14 Slice Spec

## Observable behavior

The installer validates the local Codex runtime, previews exact targets, refuses
unapproved overwrite, backs up managed conflicts on `--force`, installs three
profiles plus eleven custom agents and the shared skill, and never modifies the
base `config.toml`.

## Acceptance criteria

1. Exactly three entry profiles exist with verified GPT-5.6 model and effort.
2. Exactly eleven named Nerinhos use valid current Codex TOML.
3. Readers/reviewers/architect/auditor use read-only sandbox.
4. Mechanical/coder use workspace-write; destructive git/filesystem behavior is
   forbidden by instructions and approvals remain enabled.
5. Profiles cap subagent concurrency at six and strengthen the unsafe global
   defaults without editing them.
6. Planner produces ContextPack/TaskPacket and does not edit production.
7. Developer delegates reader/executor/test/QA and returns compact reports.
8. Quick-dev stops after QuickPlan until explicit authorization.
9. BMAD remains source of truth and is not duplicated or reinstalled.
10. Model IDs, reasoning efforts, syntax, discovery, skill and sandbox resolve in
    the installed Codex runtime.
11. Existing Codex configuration, MCPs, plugins, agents and skills are preserved.
12. Documentation explains native invocation and runtime limitations.

## Public contracts

- Profile invocation: `codex --profile <entry-point>`.
- Custom-agent names and model/effort/sandbox mapping.
- ContextPack, QuickPlan, TaskPacket and compact report schemas.
- Installer CLI flags and backup behavior.

## Non-goals

- No new MCP server, dependency, hook or AGENTS.md expansion.
- No automatic commit, push, merge or tool update.
