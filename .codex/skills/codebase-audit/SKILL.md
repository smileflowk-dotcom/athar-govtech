---
name: codebase-audit
description: Deep repository audit for ATHAR using the pinned kevinpatrickrobbins/codebase-audit workflows as an external evidence-driven playbook.
---

# ATHAR codebase audit

Use this skill when asked to deeply audit ATHAR's repository, architecture, wiring, persistence, QA readiness, or implementation gaps.

1. Read `AGENTS.md` first. ATHAR's MVP scope and security rules are authoritative.
2. Fetch the pinned tooling with `node scripts/audit/fetch-tools.mjs codebase-audit`. The command prints the temporary checkout path.
3. Read the relevant upstream playbook under that checkout's `workflows/kpr/`, starting with `gap-analysis.md`. For persistence questions also read `persistence-gap-analysis.md`; for QA use the two `qa-test-*` workflows; for human UX review use `uiux-audit-human-perspective.md`.
4. Treat upstream material as methodology, not ATHAR product requirements. Never expand ATHAR outside its declared MVP just because a generic audit suggests it.
5. Base every finding on repository evidence: file path, test result, runtime evidence, or browser evidence. Separate observed facts from inference.
6. Prioritize findings that affect the canonical ATHAR chain: source/document → requirement → observation → control → alert → evidence → human validation → provisional finding.
7. Do not auto-fix high-impact architecture/security changes. Small, reversible corrections may be proposed on a branch and must pass ATHAR tests/build before merge.
8. Never send sensitive procurement documents or case data to an external service as part of an audit.

Pinned source and commit are defined in `tools/audit-tools.json`.
