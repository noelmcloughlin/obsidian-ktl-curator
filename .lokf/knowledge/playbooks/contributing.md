---
type: Playbook
id: https://lokf-curator.example/knowledge/playbooks/contributing
title: Contributing to the plugin
description: Development setup, the pre-PR checklist (build, lint, smoke-test), and the import-free-pure-module rule for bundle.ts / trust.ts / edits.ts / settings-model.ts.
genre: how-to
resource: CONTRIBUTING.md
isPartOf:
  - https://lokf-curator.example/knowledge/playbooks/knowledge-sources
generated:
  by: process:lokf-librarian
  at: "2026-09-14T10:30:00Z"
status: draft
verified:
  - by: process:lokf-librarian
    at: "2026-09-14T12:30:00Z"
---

`npm install && npm run dev` for esbuild watch mode. Before a PR: `npm run
build` (type-check + bundle), `npm run lint` (`eslint-plugin-obsidianmd`),
`npm run smoke-test` (`bundle.ts`/`trust.ts`/`edits.ts`/`settings-model.ts`
against `scripts/fixtures/curation-bundle/`, no Obsidian needed). Anything
touching the Obsidian `App` - the vault scan, the review session's actual
writes, the mtime guard, split-leaf source opening - has no automated test
and must be checked by hand in a real vault. That boundary is the reason
`settings-model.ts` exists: logic worth testing is moved out of `main.ts`
rather than tested through it. `main.js` is generated and git-ignored,
never committed.
