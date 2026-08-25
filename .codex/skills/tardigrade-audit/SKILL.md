---
name: tardigrade-audit
description: Synthetic-user browser audit of ATHAR with the pinned noemit/tardigrade Playwright auditor.
---

# ATHAR Tardigrade audit

Use this skill for synthetic-user UX/functional audits of the running ATHAR web app.

## Safety boundary
ATHAR is security-first. Never send sensitive procurement documents or case data to an external LLM. Use fictitious/demo data for live multimodal audits. `MOCK_LLM=true` is the default smoke-test mode and requires no API key.

## Local smoke test
1. Start ATHAR on `http://127.0.0.1:3000`.
2. From `tools/tardigrade`, install dependencies and Chromium if needed.
3. Run the backend example against ATHAR with mock mode:
   `MOCK_LLM=true npm run example --workspace=packages/backend -- http://127.0.0.1:3000 default`
4. Preserve stdout/stderr and any generated run evidence as audit artifacts.

## Live synthetic-user audit
Only use a vision-capable OpenAI-compatible endpoint and demo/fictitious ATHAR data. Provide `LLM_API_KEY`, `LLM_BASE_URL`, and `LLM_MODEL` through environment/secrets, never commit credentials.

Tardigrade is evidence collection and evaluation. It does not replace ATHAR's domain rules, human validation requirement, or web-uplift's modern-web audit.

Pinned upstream source: `tools/tardigrade`.
