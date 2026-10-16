---
type: Service
id: https://ktl-curator.example/knowledge/services/curator-view
title: Curator side panel
description: "The \"Curate\" ItemView - the read-only trust report (health chips, ranked queue, open questions, active-note card) and the one-concept-at-a-time review card (evidence-first: source, claim, current trust, then the question)."
resource: src/curator-view.ts
isPartOf:
- https://ktl-curator.example/knowledge/services/ktl-curator-plugin
dependsOn:
- https://ktl-curator.example/knowledge/services/trust-engine
generated:
  by: process:ktl-librarian
  at: "2026-10-15T23:47:44Z"
status: draft
verified:
- by: process:ktl-librarian
  at: "2026-10-15T23:47:44Z"
---

# Overview

`KtlCuratorView` (`src/curator-view.ts`) renders one of two modes:

- **Report** (`renderReport`) shows, in order:
  - a bundle selector, when more than one root is configured;
  - the health line as chips, with "Confirmed by a person: a of N" visually dominant;
  - the active note, pinned, with a "Review this note" button;
  - the ranked queue as clickable cards;
  - "Open questions the librarian left";
  - the feedback, vocabulary and remaining lines.

  Since 2026-09-14 the vocabulary line reads "don't fit the known vocabulary", and says a domain schema's classes belong under *Settings → Type vocabulary*. It reads "fine" once every class is listed. The `ktl-curator` skill's `references/trust-fields.md` was reworded to match the same day; there the skill reads a host's schema from the justfile, which the plugin cannot see.

  When `plugin.hasNoBundle()` is true, an explanatory message replaces the report. It says there is no knowledge_bundle folder with an index.md and no LOKF header on the root index.md, so nothing is scanned. It points at KTL Registrar's header command, the `ktl-sidecar` skill, and the break-glass "Treat the vault root as the bundle" setting.

- **Review card** (`renderReviewCard`) opens when a person clicks a queue card. It shows the source (resolved as a vault path, else "outside the vault" with a copy button), the claim (description + type-specific fields), the concept's current trust labels, and the fixed question "Does the source still say this?". Below them are the five verb buttons, with **Wrong - send back** focused by default.

The panel's tab and the plugin's ribbon carry the `ktl-trust-ladder-check` icon (`KTL_CURATOR_ICON`): the trust ladder drawn for a 16px ribbon, two rungs (a draft, then checked by automation) under the check mark a person puts on top. `currentColor` lets the theme colour it.

## Open questions

- 2026-09-10, process:ktl-librarian: the split-leaf "Open source" behavior and the panel's rendering in a real vault have not been checked by a person - only type-checked and lint-checked.
