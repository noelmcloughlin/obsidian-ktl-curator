---
type: Playbook
id: https://lokf-curator.example/knowledge/playbooks/releasing
title: Releasing a new version
description: Semantic-release computes the version and promotes CHANGELOG.md on merge to main, behind a required-reviewer Environment; the resulting tag invokes the same hardened build-and-attest workflow a hand-pushed tag always has.
genre: how-to
resource: .github/workflows/semantic-release.yml
sources:
  - resource: .github/workflows/semantic-release.yml
  - resource: .github/workflows/release.yml
isPartOf:
  - https://lokf-curator.example/knowledge/playbooks/knowledge-sources
generated:
  by: process:lokf-librarian
  at: "2026-09-14T15:30:00Z"
verified:
  - by: process:lokf-librarian
    at: "2026-09-14T15:30:00Z"
---

A person no longer picks the version. `semantic-release.yml`'s `release` job
runs on every push to `main`, behind the `release` GitHub Environment
(required reviewers configured in this repository's own settings, not by
the workflow file): `@semantic-release/commit-analyzer` computes the next
version from Conventional Commits since the last tag; `@semantic-release/exec`
runs `.github/scripts/changelog-release.mjs` as its `verifyRelease`,
`generateNotes`, and `prepare` hooks, which refuses the run if this
repository's `CHANGELOG.md` `## [Unreleased]` section is empty, uses it as
the release notes, and then retitles it to a dated heading with a fresh
empty one above; `@semantic-release/npm` (`npmPublish: false`) bumps
`package.json` via `npm version <ver> --no-git-tag-version`, which still
triggers the existing `version` script - `manifest.json` and `versions.json`
update exactly as they did under a hand-run `npm version`, `.npmrc`'s
`tag-version-prefix=""` included, so the tag stays bare. `@semantic-release/git`
commits those files; semantic-release's own core then creates and pushes
that bare tag. The tool itself is installed at exact pinned versions inside
the workflow, never added to `package.json`.

That push then invokes `release.yml` directly, via a `workflow_call` trigger
added alongside its original `push: tags:` one - needed because a tag pushed
with the default `GITHUB_TOKEN` does not itself re-trigger another
workflow's `push` event. `release.yml` is otherwise unchanged and still
works standalone for a hand-pushed tag: harden-runner in audit mode,
`persist-credentials: false`, SHA-pinned actions, and a scoped
`contents: write` / `id-token: write` / `attestations: write` are all
exactly as before. The release is still opened as a **draft** carrying
`main.js`, `manifest.json`, `styles.css` with build-provenance attestation,
for manual review and publish - now with a second human checkpoint (the
Environment approval) in front of it.

A `pull_request`-triggered `plan` job in `semantic-release.yml` previews
every PR into `main` with `--dry-run` - no write scope, no commit, no tag -
so a malformed commit message or a broken exec script surfaces in review.

`CONTRIBUTING.md` no longer carries this detail itself: its own "Releasing"
section is now a short pointer to
[how the LOKF repositories release](https://github.com/noelmcloughlin/lokf-agent-skills/blob/main/docs/releasing.md)
in the skills repository, which is why this concept's `resource` is the
workflow files rather than `CONTRIBUTING.md`.
