---
type: Service
id: https://lokf-curator.example/knowledge/services/lokf-curator-plugin
title: LOKF Curator plugin
description: The Obsidian plugin entry point - scans configured bundle roots via metadataCache, computes and caches a trust report per bundle, owns the one-concept-at-a-time review session (curator-id modal, the five verdict verbs, the mtime guard on "corrected"), and exposes the Step 3 commands. With no bundle root configured or detected, and the break-glass "treat vault root as bundle" setting off, the vault has no bundle at all - no report, no queue, nothing written.
resource: src/main.ts
derivedFrom:
  - https://lokf-curator.example/knowledge/services/trust-engine
  - https://lokf-curator.example/knowledge/services/edits-engine
hasPart:
  - https://lokf-curator.example/knowledge/services/curator-view
  - https://lokf-curator.example/knowledge/services/settings-tab
  - https://lokf-curator.example/knowledge/services/in-editor-aids
generated:
  by: process:lokf-librarian
  at: "2026-09-12T22:00:00Z"
status: draft
verified:
  - by: process:lokf-librarian
    at: "2026-09-13T15:00:00Z"
---

# Overview

`LokfCuratorPlugin` (`src/main.ts`) is the Obsidian-facing orchestrator. It
holds no rule logic of its own - every trust label comes from
`trust-engine`, every write from `edits-engine` - and is responsible for:

- Resolving configured bundle roots (`bundleRoots()`; with none configured, the private `implicitRoots()` reads the root `index.md`'s frontmatter and whether `knowledge_bundle/index.md` exists, then defers the actual decision to `bundle.ts`'s pure `implicitBundleRoots(rootHasHeader, visibleIndexExists, treatVaultRootAsBundle)`) and re-scanning on `metadataCache` "changed" and `vault` "delete"/"rename" events, debounced 300ms. An absent root is explained only after checking Obsidian's live index, so a dot-folder root another plugin exposes is read like any other.
- **No bundle, by design.** `implicitBundleRoots` returns an empty list - not the whole vault - when the root `index.md` has no LOKF header, there is no top-level `knowledge_bundle/index.md`, and the break-glass `treatVaultRootAsBundle` setting is off: an ordinary notes vault is left alone rather than misread as one giant bundle. `hasNoBundle()` reports that state; `noBundleNotice()` explains it (pointing at LOKF Registrar's header command, the `lokf-sidecar` skill, or the break-glass setting) wherever a command or the status bar would otherwise act on a bundle that isn't there.
- Reading each candidate concept's frontmatter and headings via `metadataCache.getFileCache` (zero-content-read scan), building one `TrustRecord` per concept, and computing the ranked queue and health counts per bundle root.
- Prompting once, via a modal, for the curator id (`ensureCuratorId`) - a slug validated against `^[a-z0-9][a-z0-9-]*$`, refused if it contains `@`.
- The five verdict methods (`confirm`, `sendBack`, `corrected`, `retire`, `later`), each writing through `app.fileManager.processFrontMatter` and `app.vault.modify`, and upserting the day's `**Curation**` line in the bundle's `log.md`.
- The mtime guard: `canMarkCorrected(file)` is true only once the review card has been opened for that file and its `mtime` has since changed - the guard against pressing "Wrong - I corrected it" without having actually edited the note.
- The `Create curation policy` and `Record something missing` commands.
