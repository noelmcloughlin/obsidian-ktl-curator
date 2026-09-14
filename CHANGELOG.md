# Changelog

All notable changes to this project are documented here. The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

This is a fresh identity forked from [obsidian-lokf-enforcer](https://github.com/noelmcloughlin/obsidian-lokf-registrar) release/0.3.0 - since renamed LOKF Registrar; its changelog history belongs to that plugin, not this one.

## [Unreleased]

### Fixed

- **The curation policy's own table was only half readable.** `policies/knowledge-curation.md` names its classes in prose ("Glossary terms", "people"), but the parser matched them literally, so `GlossaryTerm`, `AttestedComputation`, `Policy` and `Person` never bound - unnoticed because their intervals matched the settings defaults until someone edited a row. The parse now ignores spaces and plural forms.
- **Deleting a concept's `## Open questions` section** left two blank lines behind when content followed it, failing markdownlint's MD012. One blank line now.

### Added

- **Known LOKF types** (*Settings → Type vocabulary*): the classes a concept's `type` may name, defaulting to the pinned schema's fifteen and refreshed on upgrade while untouched, as in LOKF Registrar's setting of the same name. A bundle validated against a domain schema (`lokf validate --schema <file>`) lists that schema's classes here, since the schema sits outside the vault: they stop counting against the report's *Vocabulary fit* line, and `policies/knowledge-curation.md` can set a review interval for them.
- **`src/settings-model.ts`**: the settings shape, defaults and saved-data merge rule, moved out of the Obsidian-bound `main.ts` so the rule is a pure function the smoke test covers. A drift guard catches a settings control naming a setting that does not exist.

### Changed

- **README restructured for the two-vault story.** An early notice says the plugin works on the exhibition, never the workshop vault you already keep, and that it pairs with the [`lokf-agent-skills`](https://github.com/noelmcloughlin/lokf-agent-skills) without needing them. *Where it works* replaces *How this fits*: three arrangements, the bundle as its own vault first, with the cost of a bundle folder inside your vault stated plainly. Host-by-host layouts moved to `docs/for-the-curious.md`.
- **README rewritten around how to use the plugin**, as an extension of the skills: *Two vaults* (two images carry the workshop/exhibition story; per-host link mechanics point at the skills' playbook), a four-step *Quick start*, *Using it* with the verb table, the command table, *Which folder is the bundle*, *Install*, *Settings*. The role table, the library metaphor and the trust-label list now live in the skills' README and are linked once rather than restated; *Install* points at the GitHub releases; the `src/` tree lists what is actually there. No plugin change.
- **This repository's own sidecar follows the current `lokf-sidecar` templates**: `just lokf-link` creates the `knowledge_bundle` doorway link, and the wrapper and both workflows describe the bundle's second name as the templates do. The doorway link is now committed at the root, `.lokf/.gitignore` keeps Obsidian's workspace state out of git, and markdownlint and lychee skip the link's duplicate path. No plugin change.

## [1.0.0] - 2026-09-13

### Changed

- **A vault with no bundle is left alone.** With nothing configured, a root `index.md` carrying a LOKF header makes the whole vault the bundle and a top-level `knowledge_bundle/` makes that the bundle, as before; a vault with neither now has *no bundle* - no report, no queue, nothing written, status bar *Curate: no bundle*, the panel says why - rather than being read as one whole-vault bundle. Mirrors LOKF Registrar. The workshop is never mistaken for the exhibition.
- README trimmed: the *For the curious* section is now `docs/for-the-curious.md`.

### Added

- **Treat the vault root as the bundle** (Scope, off by default): the break-glass switch that restores the old whole-vault reading for a vault whose root `index.md` carries no LOKF header.

### Fixed

- `npm run lint` failed on `.github/scripts/changelog-release.mjs` (outside ESLint's project); it now passes.

## [0.3.0] - 2026-09-12

### Added

- **Bundle detection for the sidecar convention.** A top-level `knowledge_bundle/` with its own `index.md`, in a vault whose root `index.md` carries no LOKF header, becomes the bundle root with nothing configured - the health line and queue then cover only the bundle. Kept identical to LOKF Registrar.
- **Semantic release.** The version is computed from Conventional Commits on `main`, and `CHANGELOG.md`'s `## [Unreleased]` section is promoted into a dated heading and used as the release notes; `manifest.json`, `package.json` and `versions.json` bump as they always did. The resulting tag runs the same build, attestation and draft release as before, and a hand-pushed tag still does too. See [CONTRIBUTING.md](CONTRIBUTING.md).

### Changed

- **The sibling plugin is now LOKF Registrar** (repository `obsidian-lokf-registrar`), renamed before either plugin was published, and named so here in the README, `NOTICE`, this repository's bundle and code comments. Nothing changes behaviour: the two stay independent, and this one never read the other's id.
- **A dot-folder bundle root is accepted, not refused** - a community plugin can expose one to Obsidian's index. The report checks the live index first and explains an absent root instead of assuming.
- **"How this fits" rewritten** around one desk that is always the person's: this plugin is the curator's assistant, LOKF Registrar the registrar beside it. It covers both ways of reaching a bundle - the doorway opened as its own vault, or a real `knowledge_bundle/` folder inside your own vault - and names the vault the **workshop**, the bundle the **exhibition**: what a person confirms goes on exhibit. References to `lokf-scaffolding` now read `lokf-sidecar`.

## [0.2.0] - 2026-09-11

### Added

- **Look up a LOKF field** (command): a searchable reference of the LOKF frontmatter fields and what each expects - so a curator unsure what a property means can look it up in the editor (Obsidian's Properties widget has no per-property description API). Descriptions come straight from the schema's own slot definitions via a pinned vocabulary manifest (`src/lokf-vocab.json`, filled by `scripts/build-vocab.mjs` from `lokf vocab --all --json` or `lokf.yaml`); `src/fields.ts` only chooses which fields to surface and in what order, so the wording never forks from the schema. A smoke test asserts every surfaced field is a real schema slot and that each description stays modal-sized. Ported from LOKF Enforcer to keep the two plugins in step; import-free (of Obsidian), Node-tested `src/fields.ts`.
- **Shared trust-tier label** (`src/trust-label.ts`): one import-free vocabulary - *Confirmed* / *Automation* / *Unchecked* / *Draft* / *Retired* - shared by the status bar, inline marker, and review card. The status bar now shows the active note's tier beside the confirmed count (e.g. `Draft · 3/12`).
- **Inline trust marker** (Settings → In-editor): a CodeMirror 6 badge on a concept's frontmatter showing its tier as you edit, derived live from the note's text (Source mode only). `@codemirror/*` added as types-only devDependencies (external at runtime).
- **Handoff hint** (§5): one phrase for where a concept sits in the librarian → curator → docent loop - *Drafted by the librarian*, *Has open questions*, *Edited since confirmed*, *Past its review date*, *Confirmed by `<id>` on `<date>`*, or *Not yet checked* - on the queue's "why" line and the marker tooltip (`handoffLabel`); `TrustRecord` gains the confirming actor/date and `generated.by`.
- **Frontmatter value autocomplete** (Settings → In-editor): an `EditorSuggest` for hand-typed values - the `human:<curatorId>` actor, the lifecycle `status`, and dates for `at`/`stale_after` - never key names (import-free `src/suggest-context.ts`).
- **Review commands + keyboard access**: "Review the next concept in the queue" and "Review the active note" open the review card (never a blind verdict); queue cards are keyboard-operable (`role="button"`, Enter/Space, focus ring).
- Recognizes the Enforcer-generated `diataxis.md` map as a reserved bundle file, so it never appears in the trust report or review queue as an unchecked concept.

### Fixed

- **The concept-type vocabulary now tracks the pinned schema.** `src/bundle.ts` derives its known LOKF classes from the schema manifest (`src/lokf-vocab.json`) rather than a hard-coded list, so `Role` - a valid concept type the list had omitted - is no longer wrongly flagged as "doesn't fit the built-in vocabulary", matching LOKF Enforcer; the curation-policy-table parser reads the same list. (The `lokf-curator` skill's "14 classes" wording lives upstream in lokf-agent-skills and should be refreshed there.)

## [0.1.0] - 2026-09-11

### Added

- Initial `lokf-curator`, a fresh identity forked from `lokf-enforcer` release/0.3.0 (manifest, package, and plugin id all renamed): a read-only trust report (health line, ranked "worth ten minutes today" queue, open questions) and a one-concept-at-a-time review session writing **Confirm** / **Send back** / **I corrected it** / **Retire** / **Later** into frontmatter and `log.md`, per the skill's `trust-fields.md` / `review-session.md`. Adds the `Create curation policy` and `Record something missing` commands and multi-bundle-root scope (from `lokf-enforcer`'s `bundle.ts`).
- `npm run smoke-test`: runs `bundle.ts` / `trust.ts` / `edits.ts` under plain Node against a fixture bundle covering every trust-label state, including the guardrail that each verb touches only its own keys.

### Fixed

Pre-release, from reviewing the first implementation against the plan:

- Verdicts silently no-op'd for any concept outside the top-`queueSize` queue (the card looked its record up in the queue, not among all scanned concepts).
- The **Due soon window** setting was ignored (30-day window hardcoded); reliance counting ran per-bundle so cross-bundle citations counted for nobody (now one IRI-keyed id map across every bundle); a cached `base_iri` was never invalidated after a root `index.md` edit.
- The day's `**Curation**` tally resumed from an earlier day's line; a `https://` source was mangled on resolve (the `:` read as a line separator); "N more not yet checked" over-counted; body edits used read-then-write instead of atomic `vault.process`.

### Changed

- Verbs refuse to write to `index.md` / `log.md` and say why; "Wrong - I corrected it" asks "the note hasn't changed - did you mean Confirm?" instead of staying disabled; the review card shows every recorded source, `fields`/`distribution` counts for tables, and a collapsible open-questions list; the feedback line reports how many entries wait, or "not reachable from this vault".
