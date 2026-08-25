---
name: tardigrade-audit
description: Synthetic-user browser audit of ATHAR with the pinned noemit/tardigrade Playwright auditor.
---

# ATHAR Tardigrade audit

Use this skill for synthetic-user UX/functional audits of the running ATHAR web app.

## Safety boundary
ATHAR is security-first. Never send sensitive procurement documents or case data to an external LLM. Use fictitious/demo data for live multimodal audits. `MOCK_LLM=true` is the default smoke-test mode and requires no API key.

## Get the pinned tool
Run `node scripts/audit/fetch-tools.mjs tardigrade`. The tool is checked out outside ATHAR's source tree so it cannot pollute Next.js builds or production dependencies.

## Validation path
Use `.github/workflows/deep-audit-tools.yml` as the reproducible smoke test. It starts ATHAR, installs/typechecks Tardigrade, installs Chromium, applies two temporary compatibility shims required by the pinned upstream mock/example path, then runs a synthetic-user exploration and the current `evaluateRun` evaluator.

## Live synthetic-user audit
Only use a vision-capable OpenAI-compatible endpoint and demo/fictitious ATHAR data. Provide `LLM_API_KEY`, `LLM_BASE_URL`, and `LLM_MODEL` through environment/secrets, never commit credentials.

Tardigrade is evidence collection and evaluation. It does not replace ATHAR's domain rules, human validation requirement, or web-uplift's modern-web audit.

Pinned source and commit are defined in `tools/audit-tools.json`.
