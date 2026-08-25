# ATHAR — audit tooling

ATHAR keeps external audit tools out of the application source tree. They are fetched on demand at pinned commits into a temporary directory, so Next.js, Docker and the production dependency graph stay untouched.

## web-uplift
Installed directly for Codex under `.web-uplift/` and `.codex/skills/web-audit/`. Used for modern-web, responsive, performance and browser-evidence audits.

## codebase-audit
Upstream: `kevinpatrickrobbins/codebase-audit` pinned at `16db555ea2c0282eb965343f109c037aeabe4d54`.

The current upstream is a collection of agent skills/workflows rather than a single executable 27-module CLI. ATHAR uses its repository-analysis workflows as an evidence-driven playbook through `.codex/skills/codebase-audit/SKILL.md`.

## Tardigrade
Upstream: `noemit/tardigrade` pinned at `9f46c0663a9d5b28cfabe0f71e74a516b60d85f7`.

Tardigrade is a Node/TypeScript + Playwright synthetic-user auditor. The pinned upstream has two inconsistencies in its mock/example path: its mock `scroll` action uses the old `direction` shape while the current schema requires `deltaX/deltaY`, and `run-example.ts` calls the legacy `scoreRun` path while the current server uses `evaluateRun`. ATHAR's validation workflow applies compatibility shims only to the temporary checkout; upstream source and ATHAR runtime are not modified.

## Fetching the pinned tools

```bash
node scripts/audit/fetch-tools.mjs
```

By default the tools are placed under the operating system temporary directory. Override with `ATHAR_AUDIT_TOOLS_DIR` when needed.

## Validation

The manual GitHub workflow `ATHAR deep audit tools` verifies:
- pinned codebase-audit workflows are accessible;
- ATHAR tests and production build remain green;
- Tardigrade installs and typechecks;
- Chromium installs;
- Tardigrade runs a synthetic-user browser exploration against local ATHAR in `MOCK_LLM=true` mode;
- the current task evaluator produces a mock finding.

## Security rule
No external audit tool may receive sensitive procurement documents or real case data. Any external-LLM Tardigrade run uses demo/fictitious data only.
