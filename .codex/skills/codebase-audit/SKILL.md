---
name: codebase-audit
description: Deep repository audit for ATHAR using the pinned kevinpatrickrobbins/codebase-audit workflows as an external evidence-driven playbook.
---

# ATHAR codebase audit

Use this skill when asked to deeply audit ATHAR's repository, architecture, wiring, persistence, QA readiness, or implementation gaps.

1. Read `AGENTS.md` first. ATHAR's MVP scope and security rules are authoritative.
2. Read the relevant upstream playbook under `tools/codebase-audit/workflows/kpr/`, starting with `gap-analysis.md`. For persistence questions also read `persistence-gap-analysis.md`; for QA use the two `qa-test-*` workflows; for human UX review use `uiux-audit-human-perspective.md`.
3. Treat the upstream repository as a methodology, not as ATHAR product requirements. Never expand ATHAR outside its declared MVP just because the generic audit suggests it.
4. Base every finding on repository evidence: file path, test result, runtime evidence, or browser evidence. Separate observed facts from inference.
5. Prioritize findings that affect the canonical ATHAR chain: source/document → requirement → observation → control → alert → evidence → human validation → provisional finding.
6. Do not auto-fix high-impact architecture/security changes. Small, reversible corrections may be proposed on a branch and must pass ATHAR tests/build before merge.
7. Never send sensitive procurement documents or case data to an external service as part of an audit.

Pinned upstream source: `tools/codebase-audit`.
