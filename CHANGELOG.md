# Changelog

All notable changes to this project are documented here. The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

This is a fresh identity forked from [KTL Registrar](https://github.com/noelmcloughlin/obsidian-ktl-registrar) release/0.3.0; its changelog history belongs to that plugin, not this one.

## [Unreleased]

### Security

- **The sidecar copies follow knowledge-trust-ladder's `main`.** `knowledge-release.yaml` is new: it attaches the bundle to a release as a tarball, runs when dispatched by hand and on each published release once `KNOWLEDGE_RELEASE_ENABLED` is `true`, and is otherwise inert. The librarian workflow and wrapper take the agent's key from the `AGENT_API_KEY` secret and hand it to the agent only, under the name `AGENT_API_KEY_ENV` gives. `knowledge-preflight.sh` compares the new workflow with its template.

## [1.3.3] - 2026-09-24

### Security

- **The sidecar's preflight and skills pin match `v0.23.1`.** The preflight now compares a librarian workflow with the template's apart from `TRUST_LADDER_SKILLS_REF`, which each repository moves on its own schedule. This repository has no bare `skills/` directory for that check to compare against, so its output does not change; no plugin change.

## [1.3.2] - 2026-09-23

### Fixed

- **The scheduled librarian installs its skill from `v0.23.0`**, the release that ships `knowledge-feedback.sh`. 1.3.1 still pinned `v0.22.0`, so the copied script matched no tag the pin named.

## [1.3.1] - 2026-09-23

### Changed

- **The README and `docs/for-the-curious.md` are restyled for the reader**: shorter sentences, plain statements, labels set off with a colon. The host-by-host layouts now live once in the skills' `docs/obsidian.md`; this repository keeps only what each layout means for the review card.

### Fixed

- **The scheduled librarian installs its skill from `v0.22.0`**, the first tag with `skills/ktl-librarian`; the weekly run had failed at that step since the plugin took the KTL name.

### Security

- **The sidecar carries `knowledge-feedback.sh`.** ktl-docent records a reader's gap through it and never opens `feedback.md`, so no other reader's text enters its session (Snyk W011). It is copied from the `ktl-sidecar` templates ahead of the release that ships it, as `knowledge-registrar.yaml` was.

## [1.3.0] - 2026-09-22

### Added

- **A dimmed counterpart for all three diagrams**, `*-dimmed.svg` beside each original: the same geometry on warm grey paper rather than a dark one. Shared byte-for-byte with the other repositories.

### Changed

- **The dark-mode source is the dimmed set.** Each `prefers-color-scheme: dark` source now points at `*-dimmed.svg`; the `*-dark.svg` files from 1.2.0 stay in `.assets/` but nothing references them.

### Fixed

- **The dimmed ink follows the dimmed paper.** The light diagrams sit right on 4.5:1, so darkening only the backgrounds would have dropped every faint label under it.
- **Three labels that never met 4.5:1 now do**, on the greyed-out roles in the plugin card - the darker ink reaches them as well.

## [1.2.0] - 2026-09-20

### Added

- **A dark counterpart for all three diagrams**, `*-dark.svg` beside each original. Same geometry and wording; only the palette differs, re-toned role for role from the light one. Shared byte-for-byte with the other repositories.
- **The README picks by theme.** Each diagram is a `<picture>` with a `prefers-color-scheme: dark` source over the existing file, so the light original stays the fallback and its path is unchanged.

### Changed

- **The ribbon and tab carry the trust ladder**, not Lucide's `gem`: two rungs - a draft, then checked by automation - under the check mark a person puts on top. Line art at Lucide's weight, in `currentColor`, so it sits with Obsidian's own icons and follows any theme. KTL Registrar's is the same ladder without the check, since it never vouches for a record.

### Fixed

- **A dark copy carries no stale content credential.** The originals embed a C2PA manifest that signs their own bytes; recolouring changes those, so the copies ship without one rather than with a signature that cannot verify.

## [1.1.9] - 2026-09-20

### Fixed

- **The description fits Obsidian's 250 characters and names LOKF.** It was 260 and never said LOKF or OKF; it now calls the plugin the curator's assistant. The manifest, the package and the community listing entry carry the same sentence.

## [1.1.8] - 2026-09-20

### Fixed

- **The type-check survives a TypeScript 7 / `@types/node` 26 bump.** `moduleResolution: "bundler"` drops the `"node"` package.json export condition by design; a newer `@types/node` gates its `node:fs`/`node:path`/`node:url` subpaths on that condition, so `scripts/smoke-test.ts`'s plain-Node imports stopped resolving. `customConditions: ["node"]` in `tsconfig.json` re-adds it. `lib` moves to `ES2022` for `Array.prototype.at()`, already used in three files; `esbuild.config.mjs`'s own output target is unaffected.

## [1.1.7] - 2026-09-19

### Fixed

- **The scheduled librarian installs `v0.21.0`**, up from `v0.19.7`, so it runs the current skill rather than two releases behind.
- **The publish job's path check reads a concept named outside ASCII.** It listed the patch's paths with git's default quoting, so such a path arrived C-quoted and was refused as outside the bundle. Synced from the skills repository's template: it now lists with `core.quotePath` off.

## [1.1.6] - 2026-09-19

### Fixed

- **An external `source` or `definedBy` is no longer flagged as dangling.** Both slots are documented as taking an off-site URL, but the audit reported any untyped IRI target as missing. Nothing in this bundle tripped it - every target happens to point at a concept.
- **The predicate list cannot go stale again.** It had drifted against the schema, missing `holder`, `measures`, `memberOf` and every reified `relations` entry; `--check-refs` reads the slots from the schema instead.
- **The scheduled librarian checks the relations it writes.** Its validate step covered frontmatter shape only, leaving a fabricated target - an agent's likeliest mistake - for the registrar gate to catch. It passes `--check-refs` now.

### Changed

- **The registrar gate validates once.** `--check-refs` rides on the existing validate step, replacing a second `lokf validate` run through `uvx --from rust-just just`.

## [1.1.5] - 2026-09-19

### Security

- **The provenance gate reads a concept whatever its name.** Synced from the skills repository's v0.19.5 templates: both gates list paths with `core.quotePath` off and refuse a path git still has to quote, so a `human:` confirmation in a non-ASCII-named concept no longer passes unread.

## [1.1.4] - 2026-09-19

### Changed

- **The scheduled librarian installs `v0.19.7`**, up from `v0.19.2`, so it runs the current skill rather than one five releases behind.
- **`LOKF_SKILLS_REPO`/`LOKF_SKILLS_REF` are now `TRUST_LADDER_SKILLS_REPO`/`TRUST_LADDER_SKILLS_REF`**, following the skills repository's own rename: the names said "LOKF" for a repository now called `knowledge-trust-ladder`. The skills keep their `lokf-*` names.

## [1.1.3] - 2026-09-19

### Added

- **The family logo**, `.assets/knowledge-trust-ladder-logo.svg`: a ladder rising out of an open book, its top rung the check mark, the rungs grey then amber then the curator's blue. Shared byte-for-byte with the other two repositories; beside the README title, and the mark to use as the repository avatar.
- **Both diagrams carry the mark and the wordmark**, from the same shared definition.

### Changed

- **The diagrams no longer glare.** A pure-white canvas was the brightest thing on the page, with the tinted cards sitting below it; it is now the warm `#E4E1D7`, so the cards read as raised.
- **Small grey labels are legible again**: the faint ink moved from `#888780` to `#6E6D66`, clearing 4.5:1 where it had been 3.6:1.
- **The skills repository is now `knowledge-trust-ladder`**, formerly `lokf-agent-skills`: upstream LOKF ships its own bundled skills, and a third-party repository named after the format read as their official home.
- **Every link here follows it**, and `LOKF_SKILLS_REPO` in the scheduled librarian names the new repository. The skill names, the pinned `LOKF_SKILLS_REF` and this plugin's own name are unchanged; GitHub redirects the old paths either way.
- **A label hidden behind its own card.** The curator card's "a few at a time" was painted before the card that contains it; two labels in the plugins card came within 3px of their edges.
- **Both diagrams match the skills repository's copies byte for byte.**
- **The bundle's log keeps the name the skills repository had on each day.** The rename pass had rewritten entries written weeks before it; `CHANGELOG.md` was left alone, and the log is the bundle's own record.

## [1.1.2] - 2026-09-18

### Fixed

- **Retitling a pull request re-runs the release checks.** The title check told the author to retitle, but the workflow listened only for the default pull-request types, so a title change fired nothing and the check stayed red whatever the author did. The trigger now names `edited`.

## [1.1.1] - 2026-09-17

### Security

- **The sidecar's scheduled-agent wrapper restores `.git/config` and `.git/hooks/` on every exit.** The copy here predated the `EXIT` trap, so an agent that poisoned `core.hooksPath` and then failed, or a cancelled job, left it for the workflow's later steps to read.
- **The registrar gate reads a confirmation whole, not its `by:` line.** Re-dating an existing `human:` event, moving its `revision` or writing it in flow style added no `by: human:` line and so passed the old gate unseen. The gate also refuses a `human:` id it cannot look up, resolves a commit-shaped `revision` against the tree, and now runs under a top-level `permissions: {}` with no checkout credential on disk.

### Fixed

- **Two bundle concepts named a resource git ignores.** They pointed at the curator skill's installed copy under `.agents/`, which exists only on a machine that has it, so the new conventions gate failed on a clean checkout. Both now name the published file at the release the workflow installs.

### Added

- **The sidecar gains the preflight, the forge-free provenance gate and the conventions parser** - `knowledge-preflight.sh`, `knowledge-provenance.sh` and `knowledge-conventions.py` - plus `.lokf/.gitattributes`, keeping the bundle on LF so a Windows checkout gives CI's verdict.
- **A pull request that would release is held to its release notes and its title.** The `plan` job refuses an empty `## [Unreleased]`, which semantic-release itself skips on a pull-request event, and refuses a title with no releasing type, since a squash merge takes its commit subject from the title.

### Changed

- **The pinned toolkit is lokf 0.8.0**, and `src/lokf-vocab.json` is rebuilt from it. `npm run build-vocab` reads the schema from the sidecar's pinned toolkit, not a sibling `../lokf` checkout; `LOKF_SCHEMA` still overrides it. No plugin behaviour change.

## [1.1.0] - 2026-09-14

### Fixed

- **The curation policy's own table was only half readable.** `policies/knowledge-curation.md` names classes in prose ("Glossary terms", "people") but the parser matched literally, so `GlossaryTerm`, `AttestedComputation`, `Policy` and `Person` never bound - unnoticed while their intervals matched the defaults. The parse now ignores spaces and plural forms.
- **Deleting a concept's `## Open questions` section** left two blank lines behind when content followed it, failing markdownlint's MD012. One blank line now.

### Added

- **Known LOKF types** (*Settings → Type vocabulary*): the classes a concept's `type` may name, defaulting to the pinned schema's fifteen and refreshed on upgrade while untouched, as in KTL Registrar's setting of the same name. A bundle validated against a domain schema (`lokf validate --schema <file>`) lists that schema's classes here, since the schema sits outside the vault: they stop counting against the report's *Vocabulary fit* line, and `policies/knowledge-curation.md` can set a review interval for them.
- **`src/settings-model.ts`**: the settings shape, defaults and saved-data merge rule, moved out of the Obsidian-bound `main.ts` so the rule is a pure function the smoke test covers. A drift guard catches a settings control naming a setting that does not exist.
- **Smoke-test coverage of the write paths and the two record templates.** Both templates are asserted to produce records this project's own tooling accepts, and the policy template is parsed back with the plugin's own parser, which is what surfaced the table bug above.

### Changed

- **README rewritten around how to use the plugin**, as an extension of the [`lokf-agent-skills`](https://github.com/noelmcloughlin/lokf-agent-skills): an early notice that it works on the exhibition, never the workshop vault you already keep; *Where it works*, with the bundle as its own vault first; a four-step *Quick start*; *Using it* with the verb table; the command table; *Which folder is the bundle*; *Install*; *Settings*. Shared material - the role table, the library metaphor, the trust labels - now lives in the skills' README and is linked once, and host-by-host layouts move to `docs/for-the-curious.md`; no plugin change.
- **This repository's own sidecar follows the current `ktl-sidecar` templates**: `just lokf-link` creates the `knowledge_bundle` doorway link, now committed at the root, and the wrapper and both workflows describe the bundle's second name as the templates do. `.lokf/.gitignore` keeps Obsidian's workspace state out of git, and markdownlint and lychee skip the link's duplicate path; no plugin change.
- **`CONTRIBUTING.md` is a checklist again**, with the release pipeline and the signing guide documented once in the skills repository's `docs/` and linked from here. `npm run check` runs build, lint and smoke test together, the settings-tab and `createEl` lint rules are errors rather than warnings, and CI fails an action not pinned to a commit; no plugin change.
- The README says which line of defence this plugin's work is, and points readers who work under that model at the skills' page on the rest; no plugin change.
- **The registrar gate checks what `lokf validate` cannot**: `.lokf/scripts/knowledge-conventions.sh` from the sidecar templates (one ISO-date log heading per day, quoted timestamps, `verified` as a list, open questions in the curator's shape) and the justfile's `lokf-check-refs`, on every `.lokf/**` pull request; no plugin change.
- **`SECURITY.md` is a policy, not a threat model**: a surface table that links to the skills repository's `docs/threat-model.md` instead of restating it, held to a word budget by `npm run check`; no plugin change.

## [1.0.0] - 2026-09-13

### Changed

- **A vault with no bundle is left alone.** With nothing configured, a root `index.md` carrying a LOKF header makes the whole vault the bundle and a top-level `knowledge_bundle/` makes that the bundle, as before; a vault with neither now has *no bundle* - no report, no queue, nothing written, status bar *Curate: no bundle*, the panel says why - rather than being read as one whole-vault bundle. Mirrors KTL Registrar. The workshop is never mistaken for the exhibition.
- README trimmed: the *For the curious* section is now `docs/for-the-curious.md`.

### Added

- **Treat the vault root as the bundle** (Scope, off by default): the break-glass switch that restores the old whole-vault reading for a vault whose root `index.md` carries no LOKF header.

### Fixed

- `npm run lint` failed on `.github/scripts/changelog-release.mjs` (outside ESLint's project); it now passes.

## [0.3.0] - 2026-09-12

### Added

- **Bundle detection for the sidecar convention.** A top-level `knowledge_bundle/` with its own `index.md`, in a vault whose root `index.md` carries no LOKF header, becomes the bundle root with nothing configured - the health line and queue then cover only the bundle. Kept identical to KTL Registrar.
- **Semantic release.** The version is computed from Conventional Commits on `main`, and `CHANGELOG.md`'s `## [Unreleased]` section is promoted into a dated heading and used as the release notes; `manifest.json`, `package.json` and `versions.json` bump as they always did. The resulting tag runs the same build, attestation and draft release as before, and a hand-pushed tag still does too. See [CONTRIBUTING.md](CONTRIBUTING.md).

### Changed

- **A dot-folder bundle root is accepted, not refused** - a community plugin can expose one to Obsidian's index. The report checks the live index first and explains an absent root instead of assuming.
- **"How this fits" rewritten** around one desk that is always the person's: this plugin is the curator's assistant, KTL Registrar the registrar beside it. It covers both ways of reaching a bundle - the doorway opened as its own vault, or a real `knowledge_bundle/` folder inside your own vault - and names the vault the **workshop**, the bundle the **exhibition**: what a person confirms goes on exhibit.

## [0.2.0] - 2026-09-11

### Added

- **Look up a LOKF field** (command): a searchable reference of the LOKF frontmatter fields and what each expects - so a curator unsure what a property means can look it up in the editor (Obsidian's Properties widget has no per-property description API). Descriptions come straight from the schema's own slot definitions via a pinned vocabulary manifest (`src/lokf-vocab.json`, filled by `scripts/build-vocab.mjs` from `lokf vocab --all --json` or `lokf.yaml`); `src/fields.ts` only chooses which fields to surface and in what order, so the wording never forks from the schema. A smoke test asserts every surfaced field is a real schema slot and that each description stays modal-sized. Ported from KTL Registrar to keep the two plugins in step; import-free (of Obsidian), Node-tested `src/fields.ts`.
- **Shared trust-tier label** (`src/trust-label.ts`): one import-free vocabulary - *Confirmed* / *Automation* / *Unchecked* / *Draft* / *Retired* - shared by the status bar, inline marker, and review card. The status bar now shows the active note's tier beside the confirmed count (e.g. `Draft · 3/12`).
- **Inline trust marker** (Settings → In-editor): a CodeMirror 6 badge on a concept's frontmatter showing its tier as you edit, derived live from the note's text (Source mode only). `@codemirror/*` added as types-only devDependencies (external at runtime).
- **Handoff hint** (§5): one phrase for where a concept sits in the librarian → curator → docent loop - *Drafted by the librarian*, *Has open questions*, *Edited since confirmed*, *Past its review date*, *Confirmed by `<id>` on `<date>`*, or *Not yet checked* - on the queue's "why" line and the marker tooltip (`handoffLabel`); `TrustRecord` gains the confirming actor/date and `generated.by`.
- **Frontmatter value autocomplete** (Settings → In-editor): an `EditorSuggest` for hand-typed values - the `human:<curatorId>` actor, the lifecycle `status`, and dates for `at`/`stale_after` - never key names (import-free `src/suggest-context.ts`).
- **Review commands + keyboard access**: "Review the next concept in the queue" and "Review the active note" open the review card (never a blind verdict); queue cards are keyboard-operable (`role="button"`, Enter/Space, focus ring).
- Recognizes the KTL Registrar-generated `diataxis.md` map as a reserved bundle file, so it never appears in the trust report or review queue as an unchecked concept.

### Fixed

- **The concept-type vocabulary now tracks the pinned schema.** `src/bundle.ts` derives its known LOKF classes from the schema manifest (`src/lokf-vocab.json`) rather than a hard-coded list, so `Role` - a valid concept type the list had omitted - is no longer wrongly flagged as "doesn't fit the built-in vocabulary", matching KTL Registrar; the curation-policy-table parser reads the same list. (The `ktl-curator` skill's "14 classes" wording lives upstream in lokf-agent-skills and should be refreshed there.)

## [0.1.0] - 2026-09-11

### Added

- Initial `ktl-curator`, a fresh identity forked from KTL Registrar release/0.3.0 (manifest, package, and plugin id all its own): a read-only trust report (health line, ranked "worth ten minutes today" queue, open questions) and a one-concept-at-a-time review session writing **Confirm** / **Send back** / **I corrected it** / **Retire** / **Later** into frontmatter and `log.md`, per the skill's `trust-fields.md` / `review-session.md`. Adds the `Create curation policy` and `Record something missing` commands and multi-bundle-root scope (from KTL Registrar's `bundle.ts`).
- `npm run smoke-test`: runs `bundle.ts` / `trust.ts` / `edits.ts` under plain Node against a fixture bundle covering every trust-label state, including the guardrail that each verb touches only its own keys.

### Fixed

Pre-release, from reviewing the first implementation against the plan:

- Verdicts silently no-op'd for any concept outside the top-`queueSize` queue (the card looked its record up in the queue, not among all scanned concepts).
- The **Due soon window** setting was ignored (30-day window hardcoded); reliance counting ran per-bundle so cross-bundle citations counted for nobody (now one IRI-keyed id map across every bundle); a cached `base_iri` was never invalidated after a root `index.md` edit.
- The day's `**Curation**` tally resumed from an earlier day's line; a `https://` source was mangled on resolve (the `:` read as a line separator); "N more not yet checked" over-counted; body edits used read-then-write instead of atomic `vault.process`.

### Changed

- Verbs refuse to write to `index.md` / `log.md` and say why; "Wrong - I corrected it" asks "the note hasn't changed - did you mean Confirm?" instead of staying disabled; the review card shows every recorded source, `fields`/`distribution` counts for tables, and a collapsible open-questions list; the feedback line reports how many entries wait, or "not reachable from this vault".
