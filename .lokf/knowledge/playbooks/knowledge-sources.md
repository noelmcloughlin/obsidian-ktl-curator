---
type: Playbook
id: https://lokf-curator.example/knowledge/playbooks/knowledge-sources
title: Knowledge sources
description: Where this bundle's concepts are derived from, and how to re-check each source on a later librarian run.
genre: how-to
resource: .
generated:
  by: process:lokf-librarian
  at: "2026-09-14T09:30:00Z"
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
| `src/bundle.ts`, `src/trust.ts`, `src/settings-model.ts` | bundle-root resolution, the trust-record model, health counts, the ranked queue, and the settings shape/defaults/merge rule | `Service` | reading the exported functions and their doc comments |
| `src/edits.ts` | the five verbs' exact frontmatter/body transforms, the `log.md` upsert | `Service` | reading the exported `apply*`/`upsert*` functions |
| `src/curator-view.ts` | the "Curate" side panel: report + review card, and the "no bundle" message | `Service` | reading the `LokfCuratorView` class |
| `src/settings.ts` | the declarative settings tab, including the break-glass "Treat the vault root as the bundle" toggle and, since 2026-09-14, the Type vocabulary group (*Known LOKF types*) | `Service` | reading `LokfCuratorSettingTab.getSettingDefinitions()`; the known-types list must stay the same shape and rule as `lokf-registrar`'s |
| `src/fields.ts`, `src/field-modal.ts`, `src/inline.ts`, `src/suggest.ts`, `src/suggest-context.ts`, `src/trust-label.ts`, `src/lokf-vocab.json` | the in-editor aids: field lookup, the inline trust badge, and frontmatter autocomplete | `Service` | reading the exported classes/functions in each file against `services/in-editor-aids.md` |
| `.agents/skills/lokf-curator/SKILL.md` and `references/trust-fields.md`, `references/review-session.md` | the spec of record this plugin implements | `Reference` | re-reading the skill's SKILL.md and references/ for drift against `src/trust.ts` / `src/edits.ts` |
| `SECURITY.md` | the plugin's privacy/write-surface guarantees; what this repository owns versus inherits in its librarian automation | `Policy` | re-reading for a changed write surface, and diffing the "what is inherited, what this repository owns" section |
| `.github/workflows/knowledge-registrar.yaml` | the gate a new `human:` confirmation must pass before it merges | `Playbook` | diff the three jobs (`validate`, `provenance`, `attestation`) against the `lokf-sidecar` template; the copy is meant to differ only by `persist-credentials: false` and a top-level `permissions: {}`, and any other difference is drift to report, not fix |
| `.github/workflows/knowledge-librarian.yaml`, `.lokf/scripts/knowledge-librarian.sh` | the scheduled librarian automation - no concept of its own here, since the design is the `lokf-sidecar` template's and `SECURITY.md` links to it | - | diff both against their templates the same way |
| `docs/for-the-curious.md` (moved out of `README.md`'s former "For the curious" section) | the four-tier trust model and where this plugin sits on it | `Explanation` | re-reading for a changed relationship to `lokf-registrar` |
| `.assets/*.svg` | the README's card and two-vaults pictures | - | decorative, consciously excluded as concepts; re-check only that the row still applies if an image starts carrying a claim the README does not |
| <https://lokf.nolan-nichols.com/specification/> | the LOKF specification itself | `Reference` | re-fetching the spec page for a version bump |
| <https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/main/okf/SPEC.md> | the OKF v0.2 specification LOKF profiles | `Reference` | re-fetching for a version bump |
| <https://pypi.org/project/lokf/> | the `lokf` toolkit this bundle's `pyproject.toml` depends on | `Reference` | `uv pip index versions lokf` |
| Obsidian's own plugin developer docs (<https://docs.obsidian.md/Plugins>) | the platform API surface (`processFrontMatter`, `metadataCache`, declarative settings) this plugin is built against | `Reference` | re-reading for a breaking API change |
| glossary terms recurring across `src/`, the skill, and the specs (`OKF`, `LOKF`, Diátaxis `genre`) | vocabulary | `GlossaryTerm` | re-reading their defining source |

## Re-check notes

**2026-09-14 (second pass)**, whole repository. `CONTRIBUTING.md` had not
been updated when `settings-model.ts` was added, so it still named three pure
modules; corrected at the source and `playbooks/contributing.md` re-derived
from it. For the next run: when a `src/` module is added or its testability
changes, check `CONTRIBUTING.md`'s table and pre-PR checklist against
`scripts/smoke-test.ts`, not only against the concept - a concept written
ahead of its source hides the drift instead of showing it.

**2026-09-14**, against the uncommitted `feat/known-types-setting` branch
(no feedback pending): swept `src/bundle.ts`, `src/trust.ts`, `src/main.ts`,
`src/settings.ts`, `src/curator-view.ts`, `scripts/smoke-test.ts`,
`README.md`, `docs/for-the-curious.md`, `CHANGELOG.md`. Corrected
`services/trust-engine.md` (the class check was still described as
"14-class"; it is the manifest's fifteen, or the list handed in) and
extended it, `services/lokf-curator-plugin.md`, `services/settings-tab.md`
and `services/curator-view.md` (with an open question on the vocabulary
line's wording versus the skill's `trust-fields.md`). Re-verified, no
change: `explanation/why-lokf-curator.md`. PyPI's `lokf` is still `0.7.0`.

Later the same day, a coverage pass on the same branch added
`src/settings-model.ts` and took the suite from 165 to 245 expectations,
surfacing the two defects `log.md` records. Updated this map's `src/` row,
`playbooks/contributing.md` (the import-free rule now names
`settings-model.ts`), `services/trust-engine.md` and
`services/lokf-curator-plugin.md`. The import-free modules are at 98.7% of
statements, 85.5% of branches; the Obsidian-bound half still has no
automated test, as `playbooks/contributing.md` says.

**2026-09-13 (night)**, after a `lokf-sidecar` repair pass on this
repository: `.lokf/.gitignore` regained the template's `.obsidian/` rule, so
opening the bundle as a vault no longer leaves workspace state for git to
see; the `knowledge_bundle` doorway link was laid at the root and excluded
from markdownlint and lychee; Step 3 found no placeholder. Swept the commit
since the prior pass (the README rewrite and its images, now committed) and
re-verified `playbooks/knowledge-registrar-gate.md` against the committed
workflow, with one correction: the copy also words two comments its own
way, not only `persist-credentials: false` and `permissions: {}`. Added the
`.assets/` row. Drift still reported, not fixed: `knowledge-librarian.yaml`
differs from its template in comments beyond `persist-credentials: false`.
PyPI's `lokf` is still `0.7.0`; no floor bump.

**2026-09-13 (evening)**: swept the commits since the prior pass
(`knowledge-registrar.yaml` gaining the template's `provenance` and
`attestation` jobs, `SECURITY.md` restructured to inherit the guard design
from `lokf-agent-skills`, two README images) and the session's uncommitted
README rewrite around usage. Added the two workflow rows above and
`playbooks/knowledge-registrar-gate.md`; removed the `CUR.md` row - that
file was deleted in the fork parent's 0.2.0 and this repository has never
had it. The installed `.agents/skills/lokf-curator/references/` copies were
byte-identical to the source skill this run. Audit fixes and the drift
findings are in `log.md`. PyPI's `lokf` is still `0.7.0`; no floor bump.

## Not yet a concept

`edits.ts`'s five verb transforms and `trust.ts`'s label rules are covered at
the module level (`services/trust-engine.md`, `services/edits-engine.md`)
rather than one concept per function - revisit only if a single function
becomes independently significant (e.g. gains its own external consumers).
