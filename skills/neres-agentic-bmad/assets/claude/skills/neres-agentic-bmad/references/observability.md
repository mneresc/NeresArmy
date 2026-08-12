# Compact observability

When the project permits operational logs, append one JSON object per completed or
blocked task to `_bmad-output/agentic-bmad/run-log.jsonl` using the template. Record:

- agent, task, tier and actual model;
- short reason_for_model;
- retry_count, escalated, final_status and audit_result.

Never record prompts, hidden reasoning, file contents, raw logs, secrets, tokens, PII
or invented financial cost. If the project does not authorize this output path, emit
the same record in the final TaskReport instead of writing a file.
