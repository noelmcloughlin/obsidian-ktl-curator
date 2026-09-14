---
type: Reference
id: https://lokf-curator.example/knowledge/references/trust-fields
title: Trust fields (lokf-curator skill)
description: The exact rule for each plain-language trust label - the spec of record trust-engine.md implements, and the source the README's health-line chips and docs/for-the-curious.md's label table summarize.
genre: reference
resource: .agents/skills/lokf-curator/references/trust-fields.md
about:
  - https://lokf-curator.example/knowledge/references/lokf-specification
generated:
  by: process:lokf-librarian
  at: "2026-09-13T19:00:00Z"
status: draft
verified:
  - by: process:lokf-librarian
    at: "2026-09-13T19:00:00Z"
---

Maps each human-facing label ("confirmed by a person", "past its review
date", ...) onto its OKF v0.2 §5 / LOKF Golden Rule 6 field, including the
parsing edge cases `src/trust.ts` handles: a bare `verified` mapping read as
a one-element list, an exact `## Open questions` heading (never a substring
match), and cross-bundle relation-target resolution. Installed locally at
`.agents/skills/lokf-curator/references/trust-fields.md` (gitignored, per
`.gitignore`'s "installed agent skills are runtime state" note) - not part
of the plugin's own source, but the plugin's implementation must not drift
from it.

## Open questions

- 2026-09-14, process:lokf-librarian: the installed copy at this concept's
  `resource` is pinned to `LOKF_SKILLS_REF: v0.9.0`
  (`.github/workflows/knowledge-librarian.yaml`, unchanged this run) and
  still reads "doesn't fit the **built-in** vocabulary", with no mention of
  a host's domain schema. `src/curator-view.ts`'s actual wording is "doesn't
  fit the **known** vocabulary" - the phrasing the skill repository's
  working tree carries past v0.9.0 (commit `5535d0c`), not the pinned copy.
  A prior pass's log entry (`log.md`, 2026-09-14) called this settled
  against the skill repository's live checkout; re-verified against the
  actual pinned resource, it is not - either bump `LOKF_SKILLS_REF` past
  `5535d0c` or record that the plugin is currently ahead of its pinned spec
  of record.
