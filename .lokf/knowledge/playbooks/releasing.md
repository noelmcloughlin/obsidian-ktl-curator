---
type: Playbook
id: https://lokf-curator.example/knowledge/playbooks/releasing
title: Releasing a new version
description: The PR-based release flow - version bump, dated changelog, tag, draft GitHub release.
genre: how-to
resource: CONTRIBUTING.md
isPartOf:
  - https://lokf-curator.example/knowledge/playbooks/knowledge-sources
generated:
  by: process:lokf-librarian
  at: "2026-09-10T00:00:00Z"
status: draft
---

From `CONTRIBUTING.md` "Releasing (maintainers)": branch `release/<version>`,
`npm version <bump> --no-git-tag-version` (updates `package.json` +
`manifest.json` + `versions.json`), date the `## [Unreleased]` heading in
`CHANGELOG.md`, merge the PR, tag the merge commit (`.npmrc`'s
`tag-version-prefix=""` keeps the tag bare, no leading `v`, as Obsidian
requires), push the tag. The release workflow then builds, attests
provenance, and opens a **draft** GitHub release carrying `main.js`,
`manifest.json`, `styles.css` for manual review and publish.

## Open questions

- 2026-09-10, process:lokf-librarian: this repository currently has no git history at all (confirmed via `git status` returning "not a git repository") - this playbook describes the process `CONTRIBUTING.md` specifies, not something exercised in this repo yet.
