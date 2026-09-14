---
type: Service
id: https://lokf-curator.example/knowledge/services/curator-view
title: Curator side panel
description: 'The "Curate" ItemView - the read-only trust report (health chips, ranked queue, open questions, active-note card) and the one-concept-at-a-time review card (evidence-first: source, claim, current trust, then the question).'
resource: src/curator-view.ts
isPartOf:
  - https://lokf-curator.example/knowledge/services/lokf-curator-plugin
dependsOn:
  - https://lokf-curator.example/knowledge/services/trust-engine
generated:
  by: process:lokf-librarian
  at: "2026-09-14T09:30:00Z"
status: draft
---

# Overview

`LokfCuratorView` (`src/curator-view.ts`) renders one of two modes:

- **Report** (`renderReport`) - a bundle selector when more than one root is configured, the health line as chips with "Confirmed by a person: a of N" visually dominant, the active note pinned with a "Review this note" button, the ranked queue as clickable cards, "Open questions the librarian left", and the feedback/vocabulary/remaining lines (since 2026-09-14 the vocabulary line reads "don't fit the known vocabulary" and says a domain schema's classes belong under *Settings → Type vocabulary*; "fine" once every class is listed - the `lokf-curator` skill's `references/trust-fields.md` was reworded to match the same day, where it reads a host's schema from the justfile the plugin cannot see). When `plugin.hasNoBundle()` is true, the report is replaced by an explanatory message instead: no knowledge_bundle folder with an index.md, and no LOKF header on the root index.md, so nothing is scanned - pointing at LOKF Registrar's header command, the `lokf-sidecar` skill, and the break-glass "Treat the vault root as the bundle" setting.
- **Review card** (`renderReviewCard`) - opened by clicking a queue card; shows the source (resolved as a vault path, else "outside the vault" with a copy button), the claim (description + type-specific fields), the concept's current trust labels, and the fixed question "Does the source still say this?" - then the five verb buttons, **Wrong - send back** focused by default.

## Open questions

- 2026-09-10, process:lokf-librarian: the split-leaf "Open source" behavior and the panel's rendering in a real vault have not been checked by a person - only type-checked and lint-checked.
