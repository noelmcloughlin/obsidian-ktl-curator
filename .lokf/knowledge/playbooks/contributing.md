---
type: Playbook
id: https://w3id.org/ktl/curator/knowledge/playbooks/contributing
title: Contributing to the plugin
description: "Development setup, npm run check (build, lint and smoke test, the same three steps CI's build.yml runs), the seven pure modules the smoke test covers, and the pull-request checklist: verb write limits, the changelog line, sibling links, the vocab refresh, releasing pull request titles, and the skills pin, which knowledge-sync.yaml and knowledge-sync.sh move with every template the release's knowledge-sync.manifest lists."
genre: how-to
resource: CONTRIBUTING.md
isPartOf:
  - https://w3id.org/ktl/curator/knowledge/playbooks/knowledge-sources
generated:
  by: process:ktl-librarian
  at: "2026-10-27T01:33:35Z"
status: draft
verified:
  - by: process:ktl-librarian
    at: "2026-10-27T01:33:35Z"
sources:
  - resource: CONTRIBUTING.md
  - resource: .lokf/scripts/knowledge-sync.sh
    title: what a sync reads, copies, adds and moves
  - resource: .github/workflows/knowledge-sync.yaml
    title: the weekly pull request and the workflow changes it holds back
---

Development needs Node 20 or later, and CI builds on 20, 22 and 24. `npm install` and then `npm run dev` start esbuild in watch mode, which rebuilds `src/main.ts` into `main.js`. `main.js` is generated and git-ignored, so a fresh clone has none until you build.

Before a pull request, run `npm run check`. It runs the build (type-check and bundle), the lint and the smoke test, the same three steps `.github/workflows/build.yml` runs. The lint is `eslint-plugin-obsidianmd`, Obsidian's guidelines as rules: fix a finding in the code rather than widen the exceptions in `eslint.config.mts`.

The smoke test (`npm run smoke-test`) runs seven pure modules (`bundle.ts`, `trust.ts`, `edits.ts`, `settings-model.ts`, `trust-label.ts`, `suggest-context.ts` and `fields.ts`) against `scripts/fixtures/curation-bundle/` under plain Node. The suite checks that `CONTRIBUTING.md`'s sentence names exactly what it imports. Everything that needs a real Obsidian `App` has no automated test and is checked by hand in a vault: `main.ts` with the scan, the review session and its writes, the curator view, the settings tab and the modals. That boundary is why logic worth testing moves out of `main.ts` rather than being tested through it.

The checklist also asks for these:

- No write exceeds what `references/review-session.md` in the `ktl-curator` skill specifies for that verb.
- A change to plugin behaviour adds a line or two under `## [Unreleased]` in `CHANGELOG.md`. The release pipeline refuses an empty one.
- A link into a sibling repository already resolves on that repository's `main`, since the link check follows it.
- `src/lokf-vocab.json` is refreshed with `npm run build-vocab`, and the result committed, only when the sidecar's pinned `lokf` moves.
- The skills pin moves with the sidecar copies: each week `knowledge-sync.yaml` opens one pull request that moves `TRUST_LADDER_SKILLS_REF` and `TRUST_LADDER_SKILLS_SHA` to the newest release and copies every template that release lists over the copy here. To move sooner, run `.lokf/scripts/knowledge-sync.sh --branch <tag>`. Never move the pin alone: the install step installs nothing when the two disagree.
- A pull request whose commits would release carries the releasing type in its title (`feat:`, `fix:`, `security:`), because a squash merge takes its subject from the title and the `plan` job refuses a mismatch.
- CI fails an action that is not pinned to a commit. Dependabot bumps the pinned action SHAs and the npm devDependencies.

`.lokf/scripts/knowledge-sync.sh` makes the copies, whether `knowledge-sync.yaml` or a person runs it:

- It reads `knowledge-sync.manifest` out of the release tag, never from a working tree, so the release itself lists the templates.
- It copies each listed template that this repository already carries over its copy. It adds a missing one only when ktl-sidecar installs that template on every host, or when a file here needs it.
- Because `website/site.config.mjs` is here, it also copies the ktl-website templates over `website/` and `.github/workflows/knowledge-website.yaml`. It leaves out `site.config.mjs`, `README.md` and `src/styles/custom.css`, which this repository owns.
- It moves `TRUST_LADDER_SKILLS_REF` and `TRUST_LADDER_SKILLS_SHA` to the tag and the commit that tag names, and writes the changelog entry under `## [Unreleased]` and `### Security`.

The weekly pull request changes no workflow but the pin. The workflow holds the other workflow changes back for a person to apply from the run, or pushes them as a second commit once a reviewer of the Environment that `KNOWLEDGE_SYNC_REVIEW_ENVIRONMENT` names approves.
