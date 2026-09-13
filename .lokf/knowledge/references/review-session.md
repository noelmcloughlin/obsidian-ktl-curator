---
type: Reference
id: https://lokf-curator.example/knowledge/references/review-session
title: Review session (lokf-curator skill)
description: The exact frontmatter/body edit for each of the five verbs, the log.md line format, and the curation-policy and missing-placeholder templates - the spec of record edits-engine.md implements.
genre: reference
resource: .agents/skills/lokf-curator/references/review-session.md
about:
  - https://lokf-curator.example/knowledge/references/lokf-specification
generated:
  by: process:lokf-librarian
  at: "2026-09-10T00:00:00Z"
status: draft
verified:
  - by: process:lokf-librarian
    at: "2026-09-13T19:00:00Z"
---

Specifies who records (`human:<id>`, never an email), the five verbs'
exact writes (Confirm / Wrong-send back / Wrong-corrected / Retire / Later),
the `log.md` line format, the curation-policy concept template, and the
missing-placeholder template. `src/edits.ts`'s functions and
`scripts/smoke-test.ts`'s fixtures are checked against this document
verbatim, not restated from memory.
