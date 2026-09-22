---
type: Playbook
id: https://ktl-curator.example/knowledge/playbooks/contributing
title: Contributing to the plugin
description: Development setup, npm run check (build, lint, smoke-test - the same three steps CI's build.yml runs), the seven-module import-free pure-module rule, and the lint-and-docs.yaml checks (action-pin, link, Markdown) it also points at.
genre: how-to
resource: CONTRIBUTING.md
isPartOf:
  - https://ktl-curator.example/knowledge/playbooks/knowledge-sources
generated:
  by: process:ktl-librarian
  at: "2026-09-14T15:30:00Z"
status: draft
verified:
  - by: process:ktl-librarian
    at: "2026-09-14T15:30:00Z"
---

`npm install && npm run dev` for esbuild watch mode. Before a PR: `npm run
check`, which runs `npm run build` (type-check + bundle), `npm run lint`
(`eslint-plugin-obsidianmd`; the settings-tab and `createEl` rules are
errors, not warnings), and `npm run smoke-test` (`bundle.ts`/`trust.ts`/
`edits.ts`/`settings-model.ts`/`trust-label.ts`/`suggest-context.ts`/
`fields.ts` against `scripts/fixtures/curation-bundle/`, no Obsidian needed;
a drift guard in the suite itself fails if this module list and
`CONTRIBUTING.md`'s own sentence ever disagree) - the same three steps
`.github/workflows/build.yml` runs in CI. `.github/workflows/lint-and-docs.yaml`
separately lints shell scripts and workflow files, fails on any `uses:` not
pinned to a commit SHA, and lints Markdown and checks links (a link into a
sibling repository must already resolve on that repository's `main`).
Anything touching the Obsidian `App` - the vault scan, the review session's
actual writes, the mtime guard, split-leaf source opening - has no
automated test and must be checked by hand in a real vault. That boundary
is the reason `settings-model.ts` exists: logic worth testing is moved out
of `main.ts` rather than tested through it. `main.js` is generated and
git-ignored, never committed.
