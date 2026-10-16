---
type: Service
id: https://ktl-curator.example/knowledge/services/settings-tab
title: Settings tab
description: "The declarative Obsidian settings tab (1.13+): curator id, the two in-editor toggles, bundle scope, the known type vocabulary, review intervals, queue size, and the feedback file path."
resource: src/settings.ts
isPartOf:
- https://ktl-curator.example/knowledge/services/ktl-curator-plugin
generated:
  by: process:ktl-librarian
  at: "2026-10-15T23:47:44Z"
status: draft
verified:
- by: process:ktl-librarian
  at: "2026-10-15T23:47:44Z"
---

# Overview

`KtlCuratorSettingTab` returns definitions from `getSettingDefinitions()` rather than building DOM. That is what puts every setting into Obsidian's settings search. The groups are:

- **Who is curating**: the curator id, validated as a slug and refused if it contains `@`.
- **In-editor**: two toggles, both on by default. `trustMarker` shows a concept's trust tier on its frontmatter in Source mode, and repaints open editors when changed. `autocomplete` offers LOKF values inside a concept's frontmatter.
- **Scope**: bundle root folders and excluded folders, kept identical to the sibling `ktl-registrar` plugin. A dot-folder entry is accepted with a warning when Obsidian's index does not list it, rather than refused. An empty list defers to the vault's own signals: a root `index.md` with a LOKF header, else a top-level `knowledge_bundle/`, else no bundle at all.
- **"Treat the vault root as the bundle (break-glass)"**: off by default, and meant to stay off. This toggle, keyed `treatVaultRootAsBundle`, restores the old whole-vault reading for a vault whose root `index.md` carries no LOKF header yet. Changing it invalidates the plugin's bundle cache.
- **Type vocabulary** (added 2026-09-14): `knownTypes`, the classes a concept's `type` may name. It defaults to the schema manifest's fifteen, and is refreshed on upgrade while still at the pre-schema fourteen, the same rule and list as `ktl-registrar`'s *Known LOKF types*. It feeds `classify()` in `src/bundle.ts`, so a domain schema's listed classes stop counting against the vocabulary-fit line. It also feeds `parseCurationPolicyTable()` in `src/trust.ts`, so `policies/knowledge-curation.md` can set an interval for them. Changing it invalidates the bundle cache.
- **Review intervals**: three interval-months settings, plus "prefer policies/knowledge-curation.md when present".
- **Queue**: queue size and the due-soon window.
- **Feedback**: the optional `feedbackFile` path.
