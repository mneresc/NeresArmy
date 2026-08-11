# S14 RED Test Plan

## Automated contract tests

- Assert exact three profiles and eleven agent filenames.
- Assert model, reasoning effort, sandbox and required TOML fields.
- Assert profile concurrency cap and on-request approval.
- Reject a missing required model.
- Verify dry-run writes nothing.
- Verify install preserves `config.toml` and unrelated files.
- Verify conflict refusal and recoverable `--force` backup.

## Live checks after GREEN

- `codex --profile <entry> exec --ephemeral --skip-git-repo-check "Reply PROFILE_OK only."`.
- `codex doctor --json` as a separate global audit. The bundle validator strictly parses managed TOMLs; `--strict-config` may independently fail on unrelated fields in the user's base configuration.
- Confirm no new doctor warning references a Neres file.
- Run safe profile smokes for planner, developer and quick-dev.
- Inspect spawned role/model/sandbox evidence where exposed.

## RED condition

The test imports `scripts/codex-bundle.mjs`, which does not exist yet. The
expected failure is `ERR_MODULE_NOT_FOUND`, proving missing behavior rather than
a skipped, fake or empty test.
