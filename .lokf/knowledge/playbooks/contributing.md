---
type: Playbook
id: https://w3id.org/ktl/curator/knowledge/playbooks/contributing
title: Contributing to the plugin
description: "Development setup, npm run check (build, lint and smoke test, the same three steps CI's build.yml runs), the seven pure modules the smoke test covers, and the pull-request checklist: verb write limits, the changelog line, sibling links, the vocab refresh, the skills pin sync and releasing pull request titles."
genre: how-to
resource: CONTRIBUTING.md
isPartOf:
  - https://w3id.org/ktl/curator/knowledge/playbooks/knowledge-sources
generated:
  by: process:ktl-librarian
  at: "2026-10-15T23:47:44Z"
status: draft
verified:
  - by: process:ktl-librarian
    at: "2026-10-18T00:10:24Z"
---

Development needs Node 20 or later, and CI builds on 20, 22 and 24. `npm install` and then `npm run dev` start esbuild in watch mode, which rebuilds `src/main.ts` into `main.js`. `main.js` is generated and git-ignored, so a fresh clone has none until you build.

Before a pull request, run `npm run check`. It runs the build (type-check and bundle), the lint and the smoke test, the same three steps `.github/workflows/build.yml` runs. The lint is `eslint-plugin-obsidianmd`, Obsidian's guidelines as rules: fix a finding in the code rather than widen the exceptions in `eslint.config.mts`.

The smoke test (`npm run smoke-test`) runs seven pure modules (`bundle.ts`, `trust.ts`, `edits.ts`, `settings-model.ts`, `trust-label.ts`, `suggest-context.ts` and `fields.ts`) against `scripts/fixtures/curation-bundle/` under plain Node. The suite checks that `CONTRIBUTING.md`'s sentence names exactly what it imports. Everything that needs a real Obsidian `App` has no automated test and is checked by hand in a vault: `main.ts` with the scan, the review session and its writes, the curator view, the settings tab and the modals. That boundary is why logic worth testing moves out of `main.ts` rather than being tested through it.

The checklist also asks for these:

- No write exceeds what `references/review-session.md` in the `ktl-curator` skill specifies for that verb.
- A change to plugin behaviour adds a line or two under `## [Unreleased]` in `CHANGELOG.md`. The release pipeline refuses an empty one.
- A link into a sibling repository already resolves on that repository's `main`, since the link check follows it.
- `src/lokf-vocab.json` is refreshed with `npm run build-vocab`, and the result committed, only when the sidecar's pinned `lokf` moves.
- Moving `TRUST_LADDER_SKILLS_REF` sets `TRUST_LADDER_SKILLS_SHA` beside it, and copies the three `knowledge-*.yaml` workflows and the files under `.lokf/scripts/` and `.lokf/m365/` from that release's templates in the same pull request.
- A pull request whose commits would release carries the releasing type in its title (`feat:`, `fix:`, `security:`), because a squash merge takes its subject from the title and the `plan` job refuses a mismatch.
- CI fails an action that is not pinned to a commit. Dependabot bumps the pinned action SHAs and the npm devDependencies.

## Open questions

- 2026-10-18, process:ktl-librarian: `CONTRIBUTING.md` says a pin move copies the three `knowledge-*.yaml` workflows, and the repository now also carries `.github/workflows/knowledge-sync.yaml`, while `.lokf/scripts/knowledge-sync.sh` copies every template the release's `knowledge-sync.manifest` lists; which should this playbook describe?
