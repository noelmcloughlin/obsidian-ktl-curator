# Change Log

## 2026-09-19

* **Reference audit moved onto the toolkit's own flag**: `just lokf-check-refs`
  ran a hand-written SPARQL query over ten relation predicates, which reported
  an external `source:` or `definedBy:` URL - correct usage for both slots - as
  a dangling target, and had drifted against the schema (missing `holder`,
  `measures`, `memberOf` and reified `relations`). It calls `lokf validate
  --check-refs` now, so the slot list comes from the schema. Only Knowledge
  registrar gate changed here, to describe the recipe as it now runs; the
  workflow no longer invokes it through `uvx ... just`: the gate's third
  step is gone and `--check-refs` rides on its validate step, copied from
  the skills template ahead of the release the pin names, so the
  preflight's `copies` line reports this file as drifted until the pin
  moves. That concept
  described the recipe while citing only the workflow, the conventions
  script and `SECURITY.md`, so `.lokf/justfile` is now one of its
  `sources`.

## 2026-09-18

* **Resources repinned off runtime state**: `references/trust-fields.md`
  and `references/review-session.md` named their installed copies under
  `.agents/`, which git ignores, so the conventions gate failed in a clean
  CI checkout. Both now name the published file at the `v0.19.2` tag the
  workflow installs.

* **Sidecar brought up to the skills templates**: the scripts here were the
  pre-0.19 copies, so the wrapper lacked the `EXIT`-trap restore and the
  registrar gate still read confirmations by their `by:` line. Synced all
  five scripts, added `.gitattributes`, and bumped `LOKF_SKILLS_REF` from
  `v0.9.0` to `v0.19.2`. The release workflow now checks release notes and
  the pull request title on a releasing pull request.

* **Open question closed**: `references/trust-fields.md` asked whether the
  plugin was ahead of its pinned spec of record on "known vocabulary". The
  `LOKF_SKILLS_REF` bump to `v0.19.2` settles it - that release carries the
  wording `src/curator-view.ts` uses.

## 2026-09-14

* **Steady-state refresh**, against the now-committed `96cf5fe` ("docs(security):
  improved layout"): `SECURITY.md` was slimmed and its design content moved
  to the skills repository's new `docs/threat-model.md`.
  `playbooks/knowledge-registrar-gate.md` corrected - two sentences named
  `SECURITY.md` as the design's home when it now only links there; retitled
  to name the threat model directly. `policies/no-telemetry.md` re-verified,
  its cited section unchanged by the rewrite. `playbooks/knowledge-sources.md`'s
  `SECURITY.md` row updated to describe the slimmed file. No new concept
  needed: this repository has always treated `SECURITY.md` as a `sources`
  entry, not a `Policy` concept of its own.

* **Steady-state refresh** (librarian pass, no feedback pending), against the
  now-committed `feba4e0` ("gate runs the conventions script and
  lokf-check-refs"): the `validate` job in
  `.github/workflows/knowledge-registrar.yaml` gained two steps -
  `scripts/knowledge-conventions.sh` and `just lokf-check-refs` - that
  `playbooks/knowledge-registrar-gate.md` did not yet describe; corrected,
  with the script added as a `sources` entry. All other concepts re-checked
  against current `src/`, `CONTRIBUTING.md`, and the pinned skill copy: no
  further drift. `references/trust-fields.md`'s open question (the installed
  copy still pinned to `LOKF_SKILLS_REF: v0.9.0` and reading "built-in
  vocabulary" against `src/curator-view.ts`'s "known vocabulary") re-checked
  and still holds, unchanged. `just lokf-validate`, `just lokf-check-refs`,
  and `scripts/knowledge-conventions.sh` all pass.
* **Steady-state refresh** against an uncommitted working-tree change
  (`CONTRIBUTING.md` rewritten as a checklist under a word budget and
  pointing at the skills repository's `docs/` for release/signing detail;
  `npm run check`; four lint rules raised to error; a drift guard added to
  `scripts/smoke-test.ts`; `build.yml`/`lint-and-docs.yaml` hardened with a
  main-only push trigger, a concurrency group, and an action-pin check).
  `playbooks/contributing.md` re-derived (the pure-module list grew from
  four to seven; CI's mirror of `npm run check` and the pin/link checks
  added). `playbooks/releasing.md`'s `resource` moved from `CONTRIBUTING.md`
  to `semantic-release.yml`/`release.yml`, since the prose it was derived
  from no longer lives in `CONTRIBUTING.md`. Four source-map rows added for
  files that predate this pass but were never listed:  `CONTRIBUTING.md`,
  `build.yml`/`lint-and-docs.yaml`, `semantic-release.yml`/`release.yml`,
  `pull_request_template.md`. `playbooks/index.md` was missing
  `knowledge-registrar-gate.md`; added.
* **Re-verified against the actual pinned resource, not the skill
  repository's live checkout:** the prior pass's log entry called
  `references/trust-fields.md`'s open question closed by pointing at the
  `lokf-agent-skills` working tree; the concept's own `resource` is the
  locally installed copy, still pinned to `v0.9.0`
  (`knowledge-librarian.yaml`'s `LOKF_SKILLS_REF`, unchanged this run) and
  still reading "built-in vocabulary" with no domain-schema mention, while
  `src/curator-view.ts` already reads "known vocabulary". Reopened as an
  open question there rather than left silently settled.
* **Re-verified, no change:** `references/obsidian-plugin-guidelines.md`
  (checked against the new `eslint.config.mts` rules) and
  `playbooks/knowledge-registrar-gate.md` (workflow file unchanged).
  `lokf` on PyPI is still `0.7.0`, matching the pinned floor - no bump
  (`uv pip index versions` has no `index` subcommand in this environment;
  checked directly against `pypi.org/pypi/lokf/json` instead).

* **`CONTRIBUTING.md` corrected, and `playbooks/contributing.md` re-derived
  from it.** The document still said the smoke test covers "the three pure
  modules" and its `src/` table had no `settings-model.ts` row, so the
  concept had been written ahead of its own source - the wrong direction for
  a derived record. Source and concept now agree, and the same check found
  the same fault in the sibling `lokf-registrar` repository.

* **Steady-state refresh** (librarian pass, no feedback pending) against the
  uncommitted `feat/known-types-setting` branch, which adds *Known LOKF
  types* (`knownTypes`) under a new **Type vocabulary** settings group - the
  same list and upgrade rule as `lokf-registrar`'s - and threads it into
  `classify()` and `parseCurationPolicyTable()`, so a bundle validated
  against a domain schema can list that schema's classes: they stop counting
  as misfits and can carry a review interval. Updated
  `services/settings-tab.md`, `services/trust-engine.md` (the class check was
  still described as "14-class"; it is the manifest's fifteen, or the list
  handed in), `services/lokf-curator-plugin.md` and
  `services/curator-view.md` (the vocabulary line's new wording, and an open
  question on its divergence from the skill's `trust-fields.md`).
  Re-verified, no change: `explanation/why-lokf-curator.md`.
  `playbooks/knowledge-sources.md`: settings row and run note.
* **Two defects found by a coverage pass**, corrected here and in the code.
  `parseCurationPolicyTable` matched a class name literally, so the prose
  rows of this plugin's own curation-policy template ("Glossary terms",
  "people") bound nothing - hidden by their intervals coinciding with the
  settings defaults. The parse now ignores spaces and English plurals, and
  `services/trust-engine.md` records rule and history; the upstream skill's
  `references/review-session.md`, spec of record for that table, states it
  too, so the two cannot drift apart again. Separately, deleting an
  `## Open questions` section left two blank lines behind it (markdownlint
  MD012); one now.
* **The open question `services/curator-view.md` raised was answered upstream
  the same day** and is closed: the `lokf-curator` skill's
  `references/trust-fields.md` now reads a host's domain schema from
  `.lokf/justfile`'s `--schema` and words the label "doesn't fit the known
  vocabulary", as this plugin already did. The plugin keeps its *Known LOKF
  types* setting because it cannot read a file outside the vault; the two no
  longer disagree about what the vocabulary is.
* **`src/settings-model.ts` is a new pure module** holding the settings
  shape, defaults and the saved-data merge rule, moved out of `main.ts` so a
  test can reach them. Recorded in `services/lokf-curator-plugin.md`, this
  map's `src/` row, and `playbooks/contributing.md`, whose import-free rule
  now names it and says why logic leaves `main.ts` rather than being tested
  through it.

## 2026-09-13

* **Steady-state refresh** (librarian pass, no feedback pending), after a
  `lokf-sidecar` repair pass that restored `.lokf/.gitignore`'s `.obsidian/`
  rule and laid the `knowledge_bundle` doorway link. Re-verified
  `playbooks/knowledge-registrar-gate.md` against the now-committed workflow;
  it now says the copy also words two comments its own way, not only
  `persist-credentials: false` and `permissions: {}`.
  `playbooks/knowledge-sources.md`: `.assets/` row and run note added.

* **Steady-state refresh** (librarian pass, no feedback pending), against the
  commits since `248f9e6` (`knowledge-registrar.yaml` gaining the template's
  `provenance`/`attestation` jobs, `SECURITY.md` restructured to inherit the
  guard design from `lokf-agent-skills`, two README images) and this
  session's uncommitted README rewrite around usage. Added
  `playbooks/knowledge-registrar-gate.md` (a gap: no source-map row, no
  concept) and two workflow rows to the source map. **Audit fixes:**
  `just lokf-check-refs` failed on four `sameAs` relations whose targets
  were the external URLs already carried by `resource` - removed from the
  four `references/*` concepts, as the sibling bundles do;
  `references/okf-specification.md` had `derivedFrom` pointing at the LOKF
  spec, backwards - moved onto `references/lokf-specification.md`, the
  profile derived from OKF; the LOKF spec's body said a "14-class"
  vocabulary, corrected to 15 (`Role`); the source map listed `CUR.md`, a
  file this repository has never had (deleted in the fork parent's 0.2.0).
  `references/trust-fields.md`'s description no longer claims a README
  trust-label table - the rewritten README links to the skills' README for
  the labels and to `docs/for-the-curious.md` for the rules. Re-verified,
  no change: `policies/no-telemetry.md`, `explanation/why-lokf-curator.md`
  (first `verified` event), `references/review-session.md` and
  `references/trust-fields.md` (the installed `.agents/skills/lokf-curator/`
  copies are identical to the source skill this run). **Drift audit
  (reported, not fixed):** both workflow copies differ from their templates
  only by the stricter `persist-credentials: false` / `permissions: {}` and
  by comments. `lokf` on PyPI is still `0.7.0`, matching the floor.

* **Steady-state refresh** (librarian pass, no feedback pending): re-verified
  `services/settings-tab.md` and `services/lokf-curator-plugin.md` against
  `src/settings.ts` and `src/main.ts` after this session's README-notice
  rewording and a comment-only pass over `src/main.ts`/`src/bundle.ts`
  (`knowledge_bundle` doorway wording, `implicitRoots`). Both already
  matched, so each gained its first `verified` event
  (`process:lokf-librarian`) rather than a content change; `status: draft`
  is unchanged - that records no human curator has confirmed them yet,
  which this refresh does not settle. `policies/no-telemetry.md` (resource
  `SECURITY.md`) and `explanation/why-lokf-curator.md` (resource
  `docs/for-the-curious.md`) were not re-checked this run - neither
  resource changed this session.

## 2026-09-12

* **Steady-state refresh** (`process:lokf-librarian`), triggered by this
  session's "no bundle" state and break-glass "Treat the vault root as the
  bundle" setting (`src/main.ts`, `src/bundle.ts`, `src/settings.ts`,
  `src/curator-view.ts`) and the README→`docs/for-the-curious.md` split:
  * `services/lokf-curator-plugin.md` - description and body corrected for
    the no-bundle state (`hasNoBundle()`/`noBundleNotice()`) and fixed
    drifted function names (`detectedRoot()`/`autoBundleRoot` no longer
    exist; the current path is `implicitRoots()` calling `bundle.ts`'s pure
    `implicitBundleRoots`).
  * `services/settings-tab.md` - added the break-glass "Treat the vault
    root as the bundle" toggle to the Scope group's description.
  * `services/curator-view.md` - added the report's no-bundle message.
  * `explanation/why-lokf-curator.md` - `resource` moved from `README.md`
    to `docs/for-the-curious.md`, where the four-tier trust model content
    now actually lives.
  * `playbooks/knowledge-sources.md` - updated the `README.md` "For the
    curious" row to point at `docs/for-the-curious.md`, and added a row for
    the in-editor-aids source files.
  * **Added** `services/in-editor-aids.md` (`status: draft`, open
    question left for a person): a new `Service` concept covering
    `src/fields.ts`, `src/field-modal.ts`, `src/inline.ts`, `src/suggest.ts`,
    `src/suggest-context.ts`, `src/trust-label.ts`, `src/lokf-vocab.json` -
    the "Look up a LOKF field" command, the inline trust badge, and
    frontmatter autocomplete - which had no concept of their own despite
    being live features since v0.2.0. Wired into `services/index.md`,
    root `index.md`, and `lokf-curator-plugin.md`'s `hasPart`.
  * Re-verified against their sources and unchanged otherwise: 13 concepts
    (`policies/no-telemetry.md`; the six `references/*.md`; the three
    `glossary/*.md`; `services/trust-engine.md`, `services/edits-engine.md`;
    `playbooks/contributing.md`) got a refreshed `process:lokf-librarian`
    `verified` event, no content changes.
  * `.lokf/pyproject.toml`: `lokf[build]` floor raised `>=0.5.0` →
    `>=0.7.0` (latest on PyPI is 0.7.0; a minor-version bump, no major
    change to review).

* **Semantic-release, hardened** (maintainer decision, matching upstream
  `lokf-registrar`): `playbooks/releasing.md` rewritten (`generated`/`verified`
  refreshed) - a person no longer picks the version. `semantic-release.yml`'s
  `release` job, behind the `release` GitHub Environment, computes it from
  Conventional Commits and runs a new `.github/scripts/changelog-release.mjs`
  as semantic-release's own `verifyRelease`/`generateNotes`/`prepare` hooks:
  refuses an empty `## [Unreleased]`, uses it as the release notes, retitles
  it to a dated heading. `@semantic-release/npm` (`npmPublish: false`) still
  triggers the existing `version` script. `release.yml` gained a
  `workflow_call` trigger for the same reason as the sibling plugin;
  unchanged otherwise.

* **Sibling renamed** (maintainer decision, upstream): LOKF Enforcer is now
  **LOKF Registrar** (`lokf-registrar`, repository `obsidian-lokf-registrar`),
  renamed for its role before either plugin was published.
  `explanation/why-lokf-curator.md` (description now says *sibling*, `generated`
  refreshed), `glossary/lokf.md`, `references/okf-specification.md`,
  `services/settings-tab.md`, `services/trust-engine.md`, and
  `playbooks/knowledge-sources.md` name it so. No relationship changed:
  siblings, no dependency either way. Entries below keep the name in use at
  the time.

* **Corrected** `services/lokf-curator-plugin.md` and `services/settings-tab.md`
  after the maintainer had the afternoon's recommendations implemented: with
  no bundle roots configured a top-level `knowledge_bundle/` is detected on
  its own (`autoBundleRoot`, identical to LOKF Enforcer's), and a dot-folder
  root is accepted with a live-index check and a warning instead of refused.

* **README restructured** around how an Obsidian user meets a knowledge
  bundle - a new "How this fits into an Obsidian vault" section (the bundle
  is the vault; a folder inside the vault; derived from a repository and
  opened through `knowledge_bundle`), where the `lokf-agent-skills` come in,
  and why a vault is never migrated into a bundle. Corrected the previous
  README's claim that a repository root opened as a vault reaches the bundle
  through the `knowledge_bundle` link: per Obsidian's own help on symbolic
  links, a link whose target is inside the same vault is ignored, and a
  dot-folder is never indexed. Other OKF validators are now mentioned once,
  in an "Alternative plugins" footnote. No concept body changed:
  `explanation/why-lokf-curator.md` already describes the relationship to
  LOKF Enforcer correctly (siblings, no dependency either way). The upstream
  skill this bundle cites as `lokf-scaffolding` is now `lokf-sidecar`
  (`playbooks/knowledge-sources.md` updated). Targeted pass, not a full
  steady-state sweep.

## 2026-09-10

* **Bootstrap discovery**: replaced the two placeholder services with 5 `Service` concepts (`lokf-curator-plugin`, `trust-engine`, `edits-engine`, `curator-view`, `settings-tab`) derived from `src/*.ts`; added 6 `Reference` concepts (the LOKF/OKF specs, the `lokf` toolkit, Obsidian's plugin guidelines, and the `lokf-curator` skill's `trust-fields.md`/`review-session.md`); 3 `GlossaryTerm` concepts (OKF, LOKF, Diátaxis genre); 1 `Policy` (no-telemetry); 1 `Explanation` (why LOKF Curator exists); and `playbooks/knowledge-sources.md` recording where each of these came from, plus `playbooks/releasing.md` and `playbooks/contributing.md` from `CONTRIBUTING.md`. All 17 new concepts are `status: draft`, none yet confirmed by a person.
* **Initialization**: Scaffolded the LOKF bundle for LOKF Curator with placeholder
  services. Real concepts to follow.
