# Change Log

## 2026-09-13

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

## 2026-09-12 (5)

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

## 2026-09-12 (4)

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

## 2026-09-12 (3)

* **Sibling renamed** (maintainer decision, upstream): LOKF Enforcer is now
  **LOKF Registrar** (`lokf-registrar`, repository `obsidian-lokf-registrar`),
  renamed for its role before either plugin was published.
  `explanation/why-lokf-curator.md` (description now says *sibling*, `generated`
  refreshed), `glossary/lokf.md`, `references/okf-specification.md`,
  `services/settings-tab.md`, `services/trust-engine.md`, and
  `playbooks/knowledge-sources.md` name it so. No relationship changed:
  siblings, no dependency either way. Entries below keep the name in use at
  the time.

## 2026-09-12 (2)

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
