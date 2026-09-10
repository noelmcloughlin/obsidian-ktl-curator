# Changelog

All notable changes to this project are documented here. The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

This is a fresh identity forked from [obsidian-lokf-enforcer](https://github.com/noelmcloughlin/obsidian-lokf-enforcer) release/0.3.0; its changelog history belongs to that plugin, not this one.

## [Unreleased]

### Added
- Initial implementation of `lokf-curator`: a read-only trust report (health line, ranked "worth ten minutes today" queue, open questions the librarian left) and a one-concept-at-a-time review session recording **Confirm** / **Wrong - send back** / **Wrong - I corrected it** / **Retire** / **Later** verdicts into frontmatter and `log.md`, per the `lokf-curator` skill's `references/trust-fields.md` and `references/review-session.md`.
- `Create curation policy` and `Record something missing` commands (the skill's two opt-in extras).
- Multi-bundle-root scope, carried over from `lokf-enforcer`'s `bundle.ts`: a vault can hold several independent bundles as sibling project folders, each with its own health line.
- `npm run smoke-test` runs `bundle.ts` / `trust.ts` / `edits.ts` under plain Node against a fixture bundle covering every trust-label state, including the plan's own guardrail as a test: each verb's frontmatter is diffed before and after, and any key outside that verb's row of the spec fails the suite.

### Fixed
Found reviewing the first implementation against the plan (`CUR.md`), before any release:
- Every verdict verb silently did nothing for a concept outside the top-`queueSize` queue - including the "Review this note" button on the active note - because the review card looked its record up in the queue rather than among all scanned concepts.
- The **Due soon window** setting was ignored: the 30-day window was hardcoded, so changing it had no effect.
- Reliance counting ("N other concepts rely on this") ran once per bundle, so a concept in one bundle citing another bundle's IRI counted for nobody; it now runs once across every bundle, as the id map is keyed by IRI. A bare relative target is now also resolved against the citing concept's own folder, and a target that names no concept no longer counts toward anything.
- A curator's first verb of the day resumed the running tally from an *earlier* day's `**Curation**` line, inflating the counts, because the search for that line was not bounded to today's section.
- A source recorded as a URL was mangled when resolved: the `:` of `https://` was treated as a line-number separator. Line and fragment suffixes are now parsed properly and shown as a hint rather than silently dropped.
- A bundle's cached `base_iri` was never invalidated, so editing the root `index.md` left every minted id (and so every reliance count) stale for the rest of the session.
- The report's "N more not yet checked" counted every scanned note that wasn't queued, including concepts nobody needs to look at; it now counts only what is genuinely still waiting behind the queue.
- Body edits used a read-then-write pair rather than the atomic `vault.process` the plan specifies.

### Changed
- Verbs refuse to write to `index.md` / `log.md` and say why, rather than relying on the scan to never hand them one.
- "Wrong - I corrected it" now asks "the note hasn't changed - did you mean Confirm?" instead of staying disabled, matching the plan; the review card also shows every recorded source (not just `resource`), `fields`/`distribution` counts for tables, and a collapsible open-questions list.
- The feedback line reports how many entries are waiting when the file is reachable, and still says "not reachable from this vault" rather than "none" when it isn't.

## [0.1.0] - 2026-09-10

### Added
- First release of this identity: `manifest.json`, `package.json`, and the plugin id all changed to `lokf-curator`.
