---
type: Service
id: https://w3id.org/ktl/curator/knowledge/services/edits-engine
title: Edits engine
description: "Pure string and object transforms for every write the review session makes: the five verbs' frontmatter and body edits, the log.md Curation and Deprecation lines, the repeated send-back hint, and the two Step-3 templates."
resource: src/edits.ts
isPartOf:
- https://w3id.org/ktl/curator/knowledge/services/ktl-curator-plugin
dependsOn:
- https://w3id.org/ktl/curator/knowledge/references/review-session
generated:
  by: process:ktl-librarian
  at: "2026-10-15T23:47:44Z"
status: draft
verified:
- by: process:ktl-librarian
  at: "2026-10-15T23:47:44Z"
---

# Overview

`src/edits.ts` has no Obsidian dependency. The caller (`main.ts`) reads the current frontmatter/body and passes it through one of these functions. It then writes the result back via `processFrontMatter` for the frontmatter and `vault.process` for the body and `log.md`.

- `applyConfirm` / `applyStaleAfter` appends the person's `verified` event. It normalizes a bare mapping to a list first and never touches a prior event. It removes `status: draft`, and sets `stale_after` only after the proposed date is accepted.
- `applySendBack` sets `status: draft`. The body edit is separate: `appendOpenQuestion` creates the `## Open questions` heading if absent, or appends under it.
- `deleteOpenQuestionsSection` removes the whole `## Open questions` section, from its heading to the next heading of level two or above, and leaves one blank line where it was.
- `applyCorrected` replaces `generated`, appends a `verified` event, and removes `status: draft`. It replaces `generated` rather than appending to it, because `generated` records who produced the *current* content.
- `applyRetire` sets `status: deprecated` and nothing else.
- `applyLater` keeps or sets `status: draft`, and sets `stale_after` only if a date was given.
- `upsertCurationLine` / `parseCurationTally` finds or creates today's `## YYYY-MM-DD` heading in `log.md`, and updates the single `**Curation**` line for that curator that day. The line is round-trippable: a later verb the same day reads the existing line's counts back out before incrementing.
- `readCurationTally` reads this curator's running tally for today back out of `log.md`, bounded to today's own heading, so the log rather than session state carries the count across a session boundary.
- `appendDeprecationLine` adds a `**Deprecation**` line right after the Curation line under today's heading when a concept is retired.
- `repeatedSendBackHint` gives the repeated-mistake hint: two send-backs the same day whose notes share their first four words.
- `renderCurationPolicyTemplate` / `renderMissingPlaceholder` render the two Step-3 command templates.

## Open questions

- 2026-09-10, process:ktl-librarian: no real review session has been run against this bundle yet with these functions - the smoke-test fixtures exercise them, but a live Obsidian vault has not.
