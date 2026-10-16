---
type: Service
id: https://w3id.org/ktl/curator/knowledge/services/in-editor-aids
title: In-editor aids
description: Three Settings → In-editor conveniences while a curator hand-edits a concept's raw frontmatter - a searchable "Look up a LOKF field" command, a live trust-tier badge on the frontmatter (Source mode only), and autocomplete for the values a curator hand-types (the human:<id> actor, status, and at/stale_after dates) - plus the shared trust-tier label vocabulary they and the status bar all render identically.
resource: src/fields.ts
isPartOf:
- https://w3id.org/ktl/curator/knowledge/services/ktl-curator-plugin
dependsOn:
- https://w3id.org/ktl/curator/knowledge/services/trust-engine
- https://w3id.org/ktl/curator/knowledge/references/lokf-toolkit
generated:
  by: process:ktl-librarian
  at: "2026-09-12T22:00:00Z"
status: draft
verified:
- by: process:ktl-librarian
  at: "2026-10-15T23:47:44Z"
---

# Overview

The plugin entry point (`src/main.ts`) connects four small, mostly import-free modules, but holds none of their logic itself:

- **Field reference**: `src/fields.ts` builds a `FieldDoc[]` (`resolveFieldDocs`). It pairs a fixed, editorial `FIELD_ORDER` list with descriptions pulled from the pinned vocabulary manifest `src/lokf-vocab.json`, which `scripts/build-vocab.mjs` fills from the schema, so the wording never forks from the schema. `src/field-modal.ts`'s `FieldReferenceModal` (a read-only `SuggestModal`) is the "Look up a LOKF field" command's surface, because Obsidian's Properties widget has no per-property description API.
- **Inline trust marker**: `src/inline.ts` is a CodeMirror 6 `ViewPlugin`. It decorates a concept's frontmatter with its trust tier as you edit, driven by a `TrustMarkerHost` the plugin implements. It works in Source mode only, because Live Preview renders frontmatter through Obsidian's own Properties widget instead.
- **Frontmatter autocomplete**: `src/suggest.ts`'s `KtlCuratorSuggest` (an `EditorSuggest`) offers values, never key names, inside a concept's frontmatter. The pure, Node-tested `src/suggest-context.ts` (`detectSuggestContext`, `withinFrontmatter`) decides what kind of value is being typed (actor / status / date), so the Obsidian-facing half stays thin.
- **Shared trust-tier vocabulary**: `src/trust-label.ts`'s `trustLabel`/`handoffLabel` (tones: `confirmed` | `automation` | `unchecked` | `draft` | `retired`) is the one wording that the status bar, the inline marker and the review card all render. It is derived from a `TrustRecord` (`trust-engine.md`) and never stored.
