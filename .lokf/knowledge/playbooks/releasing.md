---
type: Playbook
id: https://ktl-curator.example/knowledge/playbooks/releasing
title: Releasing a new version
description: Semantic-release computes the version and promotes CHANGELOG.md on a merge to main, behind the release Environment; release.yml then builds, attests and opens a draft release, from semantic-release's call, a hand-pushed tag, or a hand-run dispatch.
genre: how-to
resource: .github/workflows/semantic-release.yml
sources:
- resource: .github/workflows/semantic-release.yml
- resource: .github/workflows/release.yml
- resource: .releaserc.json
isPartOf:
- https://ktl-curator.example/knowledge/playbooks/knowledge-sources
generated:
  by: process:ktl-librarian
  at: "2026-10-15T23:47:44Z"
verified:
- by: process:ktl-librarian
  at: "2026-10-15T23:47:44Z"
---

A person no longer picks the version. Commits typed with Conventional Commits decide it, and `CHANGELOG.md`'s `## [Unreleased]` section is the release note.

`semantic-release.yml`'s `release` job runs on every push to `main`, behind the `release` GitHub Environment. Required reviewers on that environment are configured in the repository's own settings, not by the workflow file. The job installs semantic-release at exact pinned versions inside the workflow, never in `package.json`, and runs it with the plugins `.releaserc.json` names:

- `@semantic-release/commit-analyzer` computes the next version. `.releaserc.json` adds a `security` type that releases a patch.
- `@semantic-release/exec` runs `.github/scripts/changelog-release.mjs` as its `verifyRelease`, `generateNotes` and `prepare` hooks. The script refuses an empty `## [Unreleased]` section, uses it as the release notes, and promotes it to a dated version heading.
- `@semantic-release/npm` (`npmPublish: false`) bumps `package.json`, and the `version` script updates `manifest.json` and `versions.json`.
- `@semantic-release/git` commits those files and `CHANGELOG.md` with the message `chore(release): <version> - version bump, changelog promoted [skip ci]`. semantic-release then creates and pushes the bare tag (`tagFormat` is `${version}`).

After a release, the `build-and-attest` job calls `release.yml` directly through `workflow_call`, because a tag pushed with the default `GITHUB_TOKEN` does not itself trigger another workflow's `push` event. `release.yml` also runs on a hand-pushed tag. Its `workflow_dispatch` trigger runs it by hand from the Actions tab when semantic-release pushed the tag but failed before `build-and-attest`; pushing that tag again starts nothing, because it names the release commit, whose message carries `[skip ci]`.

Every path checks that the tag equals `manifest.json`'s version exactly, builds the plugin, attests build provenance for `main.js` (and `styles.css` when present), and opens a **draft** release carrying `main.js`, `manifest.json` and `styles.css` for a person to publish.

A `pull_request`-triggered `plan` job previews every pull request into `main` with `--dry-run`, with no write scope. When the commits would release (a `feat`, `fix` or `security` commit, or a breaking one), it also refuses two things: an empty `## [Unreleased]` section, and a pull request title without a releasing type. It refuses that title because a squash merge takes its subject from the title. `CONTRIBUTING.md`'s Releasing section summarises the pipeline and links to the skills repository's `docs/releasing.md`.
