---
type: Playbook
id: https://lokf-curator.example/knowledge/playbooks/knowledge-sources
title: Knowledge sources
description: Where this bundle's concepts are derived from, and how to re-check each source on a later librarian run.
genre: how-to
resource: .
generated:
  by: process:lokf-librarian
  at: "2026-09-12T22:00:00Z"
status: draft
---

# Knowledge sources

Bootstrap discovery pass (first real run of `lokf-librarian` against this
repository - the two `services/example-*.md` placeholders from
`lokf-sidecar` are removed as part of this run). Re-check each row by
re-reading the paths listed; if a path no longer exists, remove the concepts
it fed and log the removal.

| Source | Yields | Class(es) | Re-check by |
| --- | --- | --- | --- |
| `package.json`, `manifest.json` | plugin identity, id, version, dependencies | `Service` | reading `name`/`version`/`description`/`devDependencies` |
| `src/main.ts` | plugin lifecycle, commands, the review session, the five verbs' write paths | `Service` | reading exported class `LokfCuratorPlugin` and its public methods |
| `src/bundle.ts`, `src/trust.ts` | bundle-root resolution, the trust-record model, health counts, the ranked queue | `Service` | reading the exported functions and their doc comments |
| `src/edits.ts` | the five verbs' exact frontmatter/body transforms, the `log.md` upsert | `Service` | reading the exported `apply*`/`upsert*` functions |
| `src/curator-view.ts` | the "Curate" side panel: report + review card, and the "no bundle" message | `Service` | reading the `LokfCuratorView` class |
| `src/settings.ts` | the declarative settings tab, including the break-glass "Treat the vault root as the bundle" toggle | `Service` | reading `LokfCuratorSettingTab.getSettingDefinitions()` |
| `src/fields.ts`, `src/field-modal.ts`, `src/inline.ts`, `src/suggest.ts`, `src/suggest-context.ts`, `src/trust-label.ts`, `src/lokf-vocab.json` | the in-editor aids: field lookup, the inline trust badge, and frontmatter autocomplete | `Service` | reading the exported classes/functions in each file against `services/in-editor-aids.md` |
| `.agents/skills/lokf-curator/SKILL.md` and `references/trust-fields.md`, `references/review-session.md` | the spec of record this plugin implements | `Reference` | re-reading the skill's SKILL.md and references/ for drift against `src/trust.ts` / `src/edits.ts` |
| `CUR.md` | the implementation plan and architecture decisions | `Reference` | re-reading for scope/architecture changes not yet reflected in code |
| `SECURITY.md` | the plugin's privacy/write-surface guarantees | `Policy` | re-reading for a changed write surface |
| `docs/for-the-curious.md` (moved out of `README.md`'s former "For the curious" section) | the four-tier trust model and where this plugin sits on it | `Explanation` | re-reading for a changed relationship to `lokf-registrar` |
| <https://lokf.nolan-nichols.com/specification/> | the LOKF specification itself | `Reference` | re-fetching the spec page for a version bump |
| <https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/main/okf/SPEC.md> | the OKF v0.2 specification LOKF profiles | `Reference` | re-fetching for a version bump |
| <https://pypi.org/project/lokf/> | the `lokf` toolkit this bundle's `pyproject.toml` depends on | `Reference` | `uv pip index versions lokf` |
| Obsidian's own plugin developer docs (<https://docs.obsidian.md/Plugins>) | the platform API surface (`processFrontMatter`, `metadataCache`, declarative settings) this plugin is built against | `Reference` | re-reading for a breaking API change |
| glossary terms recurring across `src/`, the skill, and the specs (`OKF`, `LOKF`, Diátaxis `genre`) | vocabulary | `GlossaryTerm` | re-reading their defining source |

## Not yet a concept

`edits.ts`'s five verb transforms and `trust.ts`'s label rules are covered at
the module level (`services/trust-engine.md`, `services/edits-engine.md`)
rather than one concept per function - revisit only if a single function
becomes independently significant (e.g. gains its own external consumers).
