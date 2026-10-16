---
type: Playbook
id: https://ktl-curator.example/knowledge/playbooks/knowledge-website
title: Knowledge website
description: "The website/ folder and the knowledge-website.yaml workflow: an Astro Starlight site built from the bundle, the README, docs/ and the changelog, with a trust label on every concept page, built on pull requests and published to GitHub Pages at `https://noelmcloughlin.github.io/obsidian-ktl-curator/` once the repository variable KNOWLEDGE_WEBSITE_ENABLED is true."
genre: how-to
resource: website/README.md
sources:
- resource: website/README.md
- resource: website/site.config.mjs
- resource: website/package.json
- resource: .github/workflows/knowledge-website.yaml
- resource: eslint.config.mts
- resource: .markdownlint-cli2.jsonc
- resource: lychee.toml
dependsOn:
- https://ktl-curator.example/knowledge/references/lokf-toolkit
generated:
  by: process:ktl-librarian
  at: "2026-10-16T00:37:38Z"
status: draft
---

# Overview

`website/` builds the KTL Curator website, an Astro Starlight site. The `ktl-website` skill installed the folder and its workflow, `.github/workflows/knowledge-website.yaml`. `website/README.md` says that every page comes from a file the repository already holds, so a change to the site is a change to that file.

## What the site shows

- Each concept in `.lokf/knowledge/` becomes a page under `knowledge/`, with its trust label from `knowledge-report.sh`, its sources and its typed relations both ways.

- The four files `lokf export` writes are served under `knowledge/`, beside each concept's own Markdown file and its JSON-LD. The bundle log is served as an Atom feed, `knowledge/log.xml`.

- The README becomes the home page, and each page under `docs/` becomes a page under `docs/`.

- `CHANGELOG.md` becomes a page per release under `changelog/`, which search leaves out.

- The site shows a LinkML schema's pages and SQLite databases only when it is set up for them. `website/site.config.mjs` sets `BROWSE` to `null`, so this site serves no data.

## Preview it

`website/README.md` asks for Node.js 22.12 or later and uv. From `website/`, run `npm ci`. Then run `npm run dev` to serve the site at `http://localhost:4321/obsidian-ktl-curator/`, or `npm run build` to write `dist/` and check every link between its pages.

Both commands run `npm run sync` first. The sync runs `lokf export` from the sidecar's own environment in `.lokf/` and writes the generated pages. Nothing the sync writes is committed.

## What to edit

- To change a page's words, edit the file it comes from: the README, a page under `docs/`, or a concept. A concept changes through the librarian and the curator, like any other change to the bundle.

- To change the site's addresses, title, logo, home page or docs groups, edit `website/site.config.mjs`. A comment above each option says what it takes.

- To change the site's look, edit `website/src/styles/custom.css`, which is loaded last. `theme.css` and `catalogue.css` hold the house style, and `theme.css` holds the trust colours.

## The workflow

`.github/workflows/knowledge-website.yaml` has two jobs, for least privilege.

- `build` runs npm's packages and the lokf toolkit under a read-only token. It builds the site and checks its links. It runs on a pull request or a push that touches the site's sources, on a weekly schedule (Mondays at 05:23 UTC) and on a run by hand. A push builds on the default branch only.

- `deploy` runs only GitHub's own deploy-pages action and holds the Pages scopes. It runs for the default branch only, and only once the repository variable `KNOWLEDGE_WEBSITE_ENABLED` is `true`. A pull request gets the same build and no deployment.

To switch deployment on, first tell Pages to take its site from Actions, under Settings > Pages > Source. Then set `KNOWLEDGE_WEBSITE_ENABLED` under Repository variables, not on an environment, because a job's `if:` sees only repository and organization variables. A repository that already publishes Pages another way keeps the variable unset until that publisher is retired, since two publishers overwrite each other's site.

## The repository's other checks

`eslint.config.mts` ignores `website`, because the site is its own Node project with its own build and link check. `.markdownlint-cli2.jsonc` and `lychee.toml` leave out the folders the site's build generates, so the repository's Markdown is linted and link-checked once, where it is written.
