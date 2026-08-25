# ATHAR — audit tooling

ATHAR keeps its audit tools isolated from production code. They are pinned as Git submodules under `tools/` so updates are explicit and reviewable.

## web-uplift
Installed directly for Codex under `.web-uplift/` and `.codex/skills/web-audit/`. Used for modern-web, responsive, performance and browser-evidence audits.

## codebase-audit
Upstream: `kevinpatrickrobbins/codebase-audit` pinned at `16db555ea2c0282eb965343f109c037aeabe4d54`.

This upstream is currently a collection of agent skills and workflows rather than a single executable 27-module CLI. ATHAR uses its repository-analysis workflows as an evidence-driven playbook through `.codex/skills/codebase-audit/SKILL.md`.

Primary upstream workflow for ATHAR: `tools/codebase-audit/workflows/kpr/gap-analysis.md`.

## Tardigrade
Upstream: `noemit/tardigrade` pinned at `9f46c0663a9d5b28cfabe0f71e74a516b60d85f7`.

Tardigrade is a Node/TypeScript + Playwright synthetic-user auditor. ATHAR validates it in mock mode without an API key and may run live multimodal audits only against fictitious/demo data.

Smoke test:

```bash
MOCK_LLM=true npm run example --workspace=packages/backend -- http://127.0.0.1:3000 default
```

## Security rule
No external audit tool may receive sensitive procurement documents or real case data. External-LLM browser audits use demo/fictitious data only.
