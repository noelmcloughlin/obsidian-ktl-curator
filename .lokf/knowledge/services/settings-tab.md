---
type: Service
id: https://lokf-curator.example/knowledge/services/settings-tab
title: Settings tab
description: The declarative Obsidian settings tab (1.13+) - curator id, bundle scope, the known type vocabulary, review intervals, queue size, and the feedback file path.
resource: src/settings.ts
isPartOf:
  - https://lokf-curator.example/knowledge/services/lokf-curator-plugin
generated:
  by: process:lokf-librarian
  at: "2026-09-14T09:00:00Z"
status: draft
verified:
  - by: process:lokf-librarian
    at: "2026-09-14T09:00:00Z"
---

# Overview

`LokfCuratorSettingTab` returns definitions from `getSettingDefinitions()`
rather than building DOM, which is what puts every setting into Obsidian's
settings search. Groups: **Who is curating** (curator id, validated as a
slug and refused if it contains `@`), **Scope** (bundle root folders and
excluded folders - kept identical to the sibling `lokf-registrar` plugin: a
dot-folder entry is accepted with a warning when Obsidian's index does not
list it, rather than refused, and an empty list defers to the vault's own
signals - a root `index.md` with a LOKF header, else a top-level
`knowledge_bundle/`, else no bundle at all), **"Treat the vault root as the
bundle (break-glass)"** (off by default, and meant to stay off: a toggle,
keyed `treatVaultRootAsBundle`, that restores the old whole-vault reading
for a vault whose root `index.md` carries no LOKF header yet; changing it
invalidates the plugin's bundle cache), **Type vocabulary** (added
2026-09-14: `knownTypes`, the classes a concept's `type` may name,
defaulting to the schema manifest's fifteen and refreshed on upgrade while
still at the pre-schema fourteen - the same rule and list as
`lokf-registrar`'s *Known LOKF types*. It feeds `classify()` in
`src/bundle.ts`, so a domain schema's listed classes stop counting against
the vocabulary-fit line, and `parseCurationPolicyTable()` in `src/trust.ts`,
so `policies/knowledge-curation.md` can set an interval for them; changing
it invalidates the bundle cache), **Review intervals** (three interval-months
settings plus "prefer policies/knowledge-curation.md when present"),
**Queue** (queue size, due-soon window), **Feedback** (the optional
`feedbackFile` path).
