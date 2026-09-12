# Changelog

All notable changes to this project are documented here. The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

This is a fresh identity forked from [obsidian-lokf-enforcer](https://github.com/noelmcloughlin/obsidian-lokf-enforcer) release/0.3.0; its changelog history belongs to that plugin, not this one.

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
