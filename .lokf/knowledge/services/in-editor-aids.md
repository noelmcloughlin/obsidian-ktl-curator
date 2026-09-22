---
type: Service
id: https://ktl-curator.example/knowledge/services/in-editor-aids
title: In-editor aids
description: Three Settings → In-editor conveniences while a curator hand-edits a concept's raw frontmatter - a searchable "Look up a LOKF field" command, a live trust-tier badge on the frontmatter (Source mode only), and autocomplete for the values a curator hand-types (the human:<id> actor, status, and at/stale_after dates) - plus the shared trust-tier label vocabulary they and the status bar all render identically.
resource: src/fields.ts
isPartOf:
  - https://ktl-curator.example/knowledge/services/ktl-curator-plugin
dependsOn:
  - https://ktl-curator.example/knowledge/services/trust-engine
  - https://ktl-curator.example/knowledge/references/lokf-toolkit
generated:
  by: process:ktl-librarian
  at: "2026-09-12T22:00:00Z"
status: draft
---

# Overview

Four small, mostly import-free modules the plugin entry point (`src/main.ts`)
wires together but does not itself contain logic for:

- **Field reference** - `src/fields.ts` builds a `FieldDoc[]` (`resolveFieldDocs`) by pairing a fixed, editorial `FIELD_ORDER` list against descriptions pulled from the pinned vocabulary manifest `src/lokf-vocab.json` (filled by `scripts/build-vocab.mjs` from the schema), so wording never forks from the schema; `src/field-modal.ts`'s `FieldReferenceModal` (a read-only `SuggestModal`) is the "Look up a LOKF field" command's surface, since Obsidian's Properties widget has no per-property description API.
- **Inline trust marker** - `src/inline.ts` is a CodeMirror 6 `ViewPlugin` that decorates a concept's frontmatter with its trust tier as you edit, driven by a `TrustMarkerHost` the plugin implements; Source mode only, since Live Preview renders frontmatter through Obsidian's own Properties widget instead.
- **Frontmatter autocomplete** - `src/suggest.ts`'s `KtlCuratorSuggest` (an `EditorSuggest`) offers values, never key names, inside a concept's frontmatter; the pure, Node-tested `src/suggest-context.ts` (`detectSuggestContext`, `withinFrontmatter`) decides what kind of value is being typed (actor / status / date) so the Obsidian-facing half stays thin.
- **Shared trust-tier vocabulary** - `src/trust-label.ts`'s `trustLabel`/`handoffLabel` (tones: `confirmed` | `automation` | `unchecked` | `draft` | `retired`) is the one wording both the status bar, the inline marker, and the review card render, derived from a `TrustRecord` (`trust-engine.md`) and never stored.

## Open questions

- 2026-09-12, process:ktl-librarian: this is a librarian-created concept, not yet reviewed by a person - these four files existed before this run (the newest is dated well before this session's "no bundle"/break-glass change) but had no concept of their own until now; check the module boundaries above against current `src/main.ts` wiring.
