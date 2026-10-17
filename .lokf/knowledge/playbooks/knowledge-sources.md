---
type: Playbook
id: https://w3id.org/ktl/curator/knowledge/playbooks/knowledge-sources
title: Knowledge sources
description: Where this bundle's concepts are derived from, and how to re-check each source on a later librarian run.
genre: how-to
resource: .
generated:
  by: process:ktl-librarian
  at: "2026-10-16T23:47:52Z"
status: draft
verified:
- by: process:ktl-librarian
  at: "2026-10-16T23:47:52Z"
---

# Knowledge sources

This map lists where the bundle's concepts come from, and how a later librarian run re-checks each source. Re-check each row by re-reading the paths it lists. When a path no longer exists, remove the concepts it fed and log the removal.

| Source | Yields | Class(es) | Re-check by |
| --- | --- | --- | --- |
| `package.json`, `manifest.json`, `versions.json` | plugin identity, id, version, dependencies | `Service` | reading `name`, `version`, `description` and `devDependencies` |
| `src/main.ts` | plugin lifecycle, commands, the review session, the five verbs' write paths | `Service` | reading the exported class `KtlCuratorPlugin` and its public methods |
| `src/bundle.ts`, `src/trust.ts`, `src/settings-model.ts` | bundle-root resolution, the trust-record model, health counts, the ranked queue, and the settings shape, defaults and merge rule | `Service` | reading the exported functions and their doc comments |
| `src/edits.ts` | the five verbs' exact frontmatter and body transforms, the `log.md` upsert | `Service` | reading the exported functions |
| `src/curator-view.ts` | the "Curate" side panel: report, review card, the "no bundle" message and the panel icon | `Service` | reading the `KtlCuratorView` class |
| `src/settings.ts` | the declarative settings tab, its groups, and the break-glass "Treat the vault root as the bundle" toggle | `Service` | reading `KtlCuratorSettingTab.getSettingDefinitions()`; the known-types list keeps the same shape and rule as KTL Registrar's |
| `src/fields.ts`, `src/field-modal.ts`, `src/inline.ts`, `src/suggest.ts`, `src/suggest-context.ts`, `src/trust-label.ts`, `src/lokf-vocab.json` | the in-editor aids: field lookup, the inline trust badge, and frontmatter autocomplete | `Service` | reading the exported classes and functions in each file against `services/in-editor-aids.md` |
| the `ktl-curator` skill's `references/trust-fields.md` and `references/review-session.md`, published under <https://github.com/noelmcloughlin/knowledge-trust-ladder/tree/main/skills/ktl-curator/references> | the spec of record this plugin implements | `Reference` | re-reading both pages for drift against `src/trust.ts` and `src/edits.ts` |
| `SECURITY.md` | the plugin's promises (no network, writes only on request), reporting, supported versions, and the table of what holds each automation surface; the design lives in the skills repository's `docs/threat-model.md` | `Policy` (`no-telemetry.md`), `Playbook` (`knowledge-registrar-gate.md`) | re-reading "The plugin" section for a changed write surface, and the table for a changed workflow |
| `docs/architecture.md` | what a bundle is, the plugin's role, the two-vaults layout, the Privacy section and the `src/` layout | `Policy` (`no-telemetry.md`) | re-reading Privacy for a changed write surface |
| `docs/for-the-curious.md` | the trust labels and their fields, the four-tier trust model and where this plugin sits on it, and what it leaves to others | `Explanation` | re-reading for a changed relationship to KTL Registrar |
| `README.md`, `docs/install.md`, `docs/using.md` | the doorway, whose links now lead to the user guide's pages on the website, and the user guide: install, the panel, the review card, the in-editor aids, the commands and the settings | covered by the `services/` concepts | re-reading for a feature no service concept describes |
| `website/README.md`, `website/site.config.mjs`, `.github/workflows/knowledge-website.yaml` | the knowledge website: what each page is built from, the site's settings, and the build and GitHub Pages deployment | `Playbook` (`knowledge-website.md`) | re-reading the README's page list and "What to edit", and diffing the workflow's jobs and their `if:` conditions against `playbooks/knowledge-website.md`; the rest of `website/` is the `ktl-website` skill's code and has no concept of its own |
| `.github/workflows/knowledge-registrar.yaml`, `.lokf/curators/` | the gate a `human:` confirmation must pass before it merges, and the curator keys its second signature check reads | `Playbook` (`knowledge-registrar-gate.md`) | diffing the three jobs (`validate`, `provenance`, `attestation`) against the `ktl-sidecar` template; `SECURITY.md` says the copy keeps the template's jobs unchanged, so any other difference is drift to report, not fix |
| `.github/workflows/knowledge-librarian.yaml`, `.github/workflows/knowledge-release.yaml`, `.lokf/scripts/`, `.lokf/m365/` | the scheduled librarian, the bundle release and the sidecar's scripts; no concept of their own, since the design is the `ktl-sidecar` template's and `SECURITY.md` links to it | none | diffing each against its template the same way |
| `CONTRIBUTING.md` | development setup, the checklist before a pull request (`npm run check`) and the pure-module rule | `Playbook` (`contributing.md`) | re-reading the module sentence against `scripts/smoke-test.ts`'s own imports |
| `.github/workflows/build.yml`, `.github/workflows/lint-and-docs.yaml`, `eslint.config.mts` | CI's mirror of `npm run check`, shell and workflow lint, the pinned-action check, Markdown and link lint, and the lint rules raised to errors | `Playbook` (`contributing.md`) | diffing each job's steps against `playbooks/contributing.md` |
| `.github/workflows/semantic-release.yml`, `.github/workflows/release.yml`, `.releaserc.json`, `.github/scripts/changelog-release.mjs` | the release pipeline: the version from Conventional Commits, `CHANGELOG.md` promoted, the draft GitHub release built and attested | `Playbook` (`releasing.md`) | reading the workflows and the release config |
| `.github/pull_request_template.md` | the pull request checklist, which `CONTRIBUTING.md` calls "the short form of this list" | `Playbook` (`contributing.md`) | re-reading for a checklist item `playbooks/contributing.md` does not cover |
| `.assets/*.svg` | the card and two-vaults pictures, and the shared logo mark | none | decorative and left out as concepts on purpose; re-check only if an image starts carrying a claim the docs do not |
| <https://lokf.nolan-nichols.com/specification/> | the LOKF specification itself | `Reference` | re-fetching the spec page for a version bump |
| <https://github.com/GoogleCloudPlatform/open-knowledge-format/blob/main/SPEC.md> | the OKF v0.2 specification LOKF profiles | `Reference` | re-fetching for a version bump |
| <https://pypi.org/project/lokf/>, `scripts/build-vocab.mjs` | the `lokf` toolkit this bundle's `pyproject.toml` depends on, and the maintenance step that reads its schema into `src/lokf-vocab.json` | `Reference` (`lokf-toolkit.md`) | `uvx --from pip pip index versions lokf`, and re-reading the header of `build-vocab.mjs` |
| Obsidian's plugin developer docs (<https://docs.obsidian.md/Plugins>) | the platform API this plugin is built against (`processFrontMatter`, `metadataCache`, declarative settings) | `Reference` | re-reading for a breaking API change |
| glossary terms recurring across `src/`, the skill and the specs (`OKF`, `LOKF`, Diátaxis `genre`) | vocabulary | `GlossaryTerm` | re-reading their defining source |

## How to re-check

Start from `bash .lokf/scripts/knowledge-report.sh worklist`, which names the concepts whose sources moved since they were derived or last checked.

When a `src/` module is added or its testability changes, check `CONTRIBUTING.md`'s module sentence and checklist against `scripts/smoke-test.ts`, not only against the concept. A concept written ahead of its source hides the drift instead of showing it.

Check a sidecar copy (a `knowledge-*.yaml` workflow, or a file under `.lokf/scripts/` or `.lokf/m365/`) against the `ktl-sidecar` templates at the release `TRUST_LADDER_SKILLS_REF` names. `knowledge-preflight.sh` reports drift on its `copies` line.

## Not yet a concept

- `edits.ts`'s verb transforms and `trust.ts`'s label rules are covered at module level (`services/trust-engine.md`, `services/edits-engine.md`), not one concept per function. Revisit only if a single function becomes independently significant, for example by gaining its own external consumers.
- `docs/install.md` and `docs/using.md`, the user guide, are covered through the service concepts they describe.
- `AI_COVENANT.md`, the rules for AI-assisted contributions, has no concept yet.
- Left out on purpose: the build and editor configuration (`esbuild.config.mjs`, `tsconfig.json`, `.editorconfig`, `.npmrc`, `.gitignore`, `styles.css`, `version-bump.mjs`, `.github/dependabot.yml`), the community files (`CODE_OF_CONDUCT.md`, `LICENSE`, `NOTICE`, `.github/ISSUE_TEMPLATE/`), `community-plugin-entry.json`, `CHANGELOG.md`, `llms.txt`, the smoke test's fixtures under `scripts/fixtures/`, and the sidecar's `.lokf/README.md` and `.lokf/queries.http`. Add a concept for one of them only when it carries a claim that no mapped source makes.
