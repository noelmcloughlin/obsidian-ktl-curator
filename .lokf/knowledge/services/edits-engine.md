---
type: Service
id: https://lokf-curator.example/knowledge/services/edits-engine
title: Edits engine
description: Pure string/object transforms for every write the review session makes - the five verbs' frontmatter and body edits, the log.md upsert, and the two Step-3 templates.
resource: src/edits.ts
isPartOf:
  - https://lokf-curator.example/knowledge/services/lokf-curator-plugin
dependsOn:
  - https://lokf-curator.example/knowledge/references/review-session
generated:
  by: process:lokf-librarian
  at: "2026-09-10T00:00:00Z"
status: draft
verified:
  - by: process:lokf-librarian
    at: "2026-09-12T22:00:00Z"
---

# Overview

`src/edits.ts` has no Obsidian dependency - the caller (`main.ts`) reads the
current frontmatter/body, passes it through one of these functions, and
writes the result back via `processFrontMatter`/`vault.modify`.

- `applyConfirm` / `applyStaleAfter` - appends the person's `verified` event (normalizing a bare mapping to a list first, never touching a prior event), removes `status: draft`, and sets `stale_after` only after the proposed date is accepted.
- `applySendBack` - sets `status: draft`; the body edit is separate, `appendOpenQuestion`, which creates the `## Open questions` heading if absent or appends under it.
- `applyCorrected` - replaces `generated` (not appended - it records who produced the *current* content), appends a `verified` event, removes `status: draft`.
- `applyRetire` - sets `status: deprecated` and nothing else.
- `applyLater` - keeps/sets `status: draft`; `stale_after` only if a date was given.
- `upsertCurationLine` / `parseCurationTally` - finds or creates today's `## YYYY-MM-DD` heading in `log.md` and updates the single `**Curation**` line for that curator that day (round-trippable: a later verb the same day reads the existing line's counts back out before incrementing).
- `renderCurationPolicyTemplate` / `renderMissingPlaceholder` - the two Step-3 command templates.

## Open questions

- 2026-09-10, process:lokf-librarian: no real review session has been run against this bundle yet with these functions - the smoke-test fixtures exercise them, but a live Obsidian vault has not.
