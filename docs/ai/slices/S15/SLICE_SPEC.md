# Slice spec — S15

## In scope

- `/neres-planner`, `/neres-developer`, `/neres-quick-dev` Devin skills.
- Shared `neres-agentic-bmad` Devin protocol and compact contracts.
- Four planning and seven development custom subagents.
- Stable `swe`/`opus` aliases only in shipped definitions; alternative model
  families remain runtime candidates after `devin models list --format json`.
- Capability discovery policy for local tools, repo skills and MCPs.
- Project and user installation with dry-run, conflict refusal and backup.
- Fixture/live validators and documentation.
- Codex/OpenCode shared capability-discovery update.

## Out of scope

- Installing/updating Devin CLI or Desktop.
- Adding, authenticating or changing work MCP servers.
- Persisting work credentials, organization IDs or private repository details.
- Assuming BMAD exists in the work organization.
- Publishing, committing, pushing or merging.

## Acceptance

1. The bundle contains exactly 3 entry skills, 1 protocol skill and 11 subagents.
2. Every entry discovers skills and MCPs before choosing tools.
3. BMAD routes are used only when discovered; equivalent skills are selected by
   public outcome when BMAD is absent.
4. Quick-dev stops after QuickPlan until later explicit approval.
5. Read-only roles cannot edit or execute shell commands; write roles forbid
   commits, pushes, destructive cleanup and secret access in their instructions.
6. Project install writes only `.agents/skills` and `.agents/agents`; user install
   writes only the selected Devin home skills/agents directories.
7. Conflicts fail unless `--force`, which creates a recoverable backup.
8. No installer edits config, MCP settings or unrelated files.
9. Codex/OpenCode shared instructions prefer relevant available MCPs/skills while
   retaining deterministic tests and least privilege.
