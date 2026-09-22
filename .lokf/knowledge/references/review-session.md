---
type: Reference
id: https://ktl-curator.example/knowledge/references/review-session
title: Review session (ktl-curator skill)
description: The exact frontmatter/body edit for each of the five verbs, the log.md line format, and the curation-policy and missing-placeholder templates - the spec of record edits-engine.md implements.
genre: reference
resource: https://github.com/noelmcloughlin/knowledge-trust-ladder/blob/main/skills/ktl-curator/references/review-session.md
about:
  - https://ktl-curator.example/knowledge/references/lokf-specification
generated:
  by: process:ktl-librarian
  at: "2026-09-18T11:00:00Z"
status: draft
verified:
  - by: process:ktl-librarian
    at: "2026-09-18T11:00:00Z"
---

Specifies who records (`human:<id>`, never an email), the five verbs'
exact writes (Confirm / Wrong-send back / Wrong-corrected / Retire / Later),
the `log.md` line format, the curation-policy concept template, and the
missing-placeholder template. `src/edits.ts`'s functions and
`scripts/smoke-test.ts`'s fixtures are checked against this document
verbatim, not restated from memory.
