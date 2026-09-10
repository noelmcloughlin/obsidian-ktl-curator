---
type: Service
id: https://lokf-curator.example/knowledge/services/lokf-curator-plugin
title: LOKF Curator plugin
description: The Obsidian plugin entry point - scans configured bundle roots via metadataCache, computes and caches a trust report per bundle, owns the one-concept-at-a-time review session (curator-id modal, the five verdict verbs, the mtime guard on "corrected"), and exposes the Step 3 commands.
resource: src/main.ts
derivedFrom:
  - https://lokf-curator.example/knowledge/services/trust-engine
  - https://lokf-curator.example/knowledge/services/edits-engine
hasPart:
  - https://lokf-curator.example/knowledge/services/curator-view
  - https://lokf-curator.example/knowledge/services/settings-tab
generated:
  by: process:lokf-librarian
  at: "2026-09-10T00:00:00Z"
status: draft
---

# Overview

`LokfCuratorPlugin` (`src/main.ts`) is the Obsidian-facing orchestrator. It
holds no rule logic of its own - every trust label comes from
`trust-engine`, every write from `edits-engine` - and is responsible for:

- Resolving configured bundle roots (`bundle.ts`'s `normalizeBundleRoots`/`resolveBundleRoot`) and re-scanning on `metadataCache` "changed" and `vault` "delete"/"rename" events, debounced 300ms.
- Reading each candidate concept's frontmatter and headings via `metadataCache.getFileCache` (zero-content-read scan), building one `TrustRecord` per concept, and computing the ranked queue and health counts per bundle root.
- Prompting once, via a modal, for the curator id (`ensureCuratorId`) - a slug validated against `^[a-z0-9][a-z0-9-]*$`, refused if it contains `@`.
- The five verdict methods (`confirm`, `sendBack`, `corrected`, `retire`, `later`), each writing through `app.fileManager.processFrontMatter` and `app.vault.modify`, and upserting the day's `**Curation**` line in the bundle's `log.md`.
- The mtime guard: `canMarkCorrected(file)` is true only once the review card has been opened for that file and its `mtime` has since changed - the guard against pressing "Wrong - I corrected it" without having actually edited the note.
- The `Create curation policy` and `Record something missing` commands.
