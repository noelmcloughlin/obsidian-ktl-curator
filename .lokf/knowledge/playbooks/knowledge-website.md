---
type: Playbook
id: https://w3id.org/ktl/curator/knowledge/playbooks/knowledge-website
title: Knowledge website
description: "The website/ folder and the knowledge-website.yaml workflow: a Hugo site built from the bundle, the README, docs/ and the changelog, with a trust label on every concept page, built on pull requests and published to GitHub Pages at `https://noelmcloughlin.github.io/obsidian-ktl-curator/` once the repository variable KNOWLEDGE_WEBSITE_ENABLED is true."
genre: how-to
resource: website/README.md
sources:
  - resource: website/README.md
  - resource: website/site.toml
  - resource: website/hugo.toml
  - resource: website/scripts/build.sh
  - resource: website/scripts/prepare.sh
  - resource: .github/workflows/knowledge-website.yaml
  - resource: eslint.config.mts
  - resource: .markdownlint-cli2.jsonc
  - resource: lychee.toml
dependsOn:
  - https://w3id.org/ktl/curator/knowledge/references/lokf-toolkit
generated:
  by: process:ktl-librarian
  at: "2026-11-15T03:15:58Z"
status: draft
verified:
  - by: process:ktl-librarian
    at: "2026-11-02T13:23:24Z"
---

# Overview

`website/` builds the KTL Curator website with Hugo. The `ktl-website` skill installed the folder and its workflow, `.github/workflows/knowledge-website.yaml`. `website/README.md` says that every page comes from a file the repository already holds, so a change to the site is a change to that file.

## What the site shows

- Each concept in `.lokf/knowledge/` becomes a page under `knowledge/`, with its trust label from `knowledge-report.sh`, its sources and its relations both ways. The bundle also gives the health page and the graph.

- The four files `lokf export` writes are served under `knowledge/`, beside each concept's own Markdown file and its JSON-LD. The bundle log is served as an Atom feed, `knowledge/log.xml`.

- The README becomes the home page, and each page under `docs/` becomes a page under `docs/`.

- `CHANGELOG.md` becomes a page per release under `changelog/`, which search leaves out.

- The figures in `.assets/` are served under `assets/`.

- This repository holds no LinkML schema of its own, so the Schema part shows LOKF core, the schema the bundle is written in.

- `website/site.toml` names no `browse` folder, so the site serves no data.

## Preview it

The build needs bash, git and uv, and no Node.js. Hugo and Pagefind come from PyPI, at the versions `website/pyproject.toml` names and the hashes `website/uv.lock` holds. Run these from `website/`:

- `scripts/build.sh` writes `dist/` with its search index, then checks every link between its pages.

- `scripts/build.sh serve` serves the site at `http://localhost:1313/obsidian-ktl-curator/` and rebuilds it as you edit.

- `scripts/build.sh preview` serves the site as it will be published, at `http://localhost:1313/`.

`build.sh` runs `scripts/prepare.sh` first. It writes the four files `lokf export` writes, the schema pages LinkML's `gen-doc` writes, and the trust labels `knowledge-report.sh` prints. It runs both tools from the sidecar's own environment in `.lokf/`. Nothing the build writes is committed.

## What to edit

- To change a page's words, edit the file it comes from: the README, a page under `docs/`, or a concept. A concept changes through the librarian and the curator, like any other change to the bundle.

- To change the site's address, title, description or repository, edit `website/site.toml`. It also takes a logo, the docs pages' groups, more docs folders to leave out, old addresses to redirect, and the data to publish. A comment above each option says what it takes.

- To change the site's look, edit `website/assets/css/custom.css`, which is loaded last. The colours and the trust tones are custom properties at the top of `website/assets/css/site.css`.

`site.toml`, `custom.css` and `website/README.md` are this repository's own. Every other file in `website/` is a copy of the ktl-website skill's template. The skill's repair replaces those copies, so a change to one belongs in the skill's repository.

## The workflow

`.github/workflows/knowledge-website.yaml` has two jobs, for least privilege.

- `build` runs Hugo, Pagefind, the lokf toolkit and the site's own code under a read-only token. It builds the site with `scripts/build.sh` and checks its links. It runs on a pull request or a push that touches the site's sources, on a weekly schedule (Mondays at 05:23 UTC) and on a run by hand. A push builds on the default branch only.

- `deploy` runs harden-runner and GitHub's own deploy-pages action, and holds the Pages scopes. It runs for the default branch only, and only once the repository variable `KNOWLEDGE_WEBSITE_ENABLED` is `true`. A pull request gets the same build and no deployment.

The weekly run catches what no push brings, such as the changelog's promotion, whose commit skips CI.

To switch deployment on, first tell Pages to take its site from Actions, under Settings > Pages > Source. Then set `KNOWLEDGE_WEBSITE_ENABLED` under Repository variables, not on an environment, because a job's `if:` sees only repository and organization variables. A repository that already publishes Pages another way keeps the variable unset until that publisher is retired, since two publishers overwrite each other's site.

## The repository's other checks

`eslint.config.mts` ignores `website`, because the site has its own build and link check. `.markdownlint-cli2.jsonc` and `lychee.toml` leave out the folders the site's build writes, so the repository's Markdown is linted and link-checked once, where it is written.
