---
lokf_version: "0.2"
okf_version: "0.2"
base_iri: https://w3id.org/ktl/curator/knowledge/
context: https://w3id.org/lokf/context.jsonld
title: KTL Curator Knowledge Bundle
description: "Help a person judge what a LOKF knowledge bundle claims: a trust report computed from frontmatter, and a review session that records confirm, send back, and retire verdicts in the bundle itself"
license: https://creativecommons.org/licenses/by/4.0/
publisher:
  type: Person
  id: https://w3id.org/ktl/curator/knowledge/person/noel-mcloughlin
  name: Noel McLoughlin
---

# KTL Curator Knowledge Bundle

A [LOKF](https://lokf.nolan-nichols.com) knowledge base for KTL Curator. Every Markdown file under `knowledge/` is one concept; together they form a queryable knowledge graph, derived from this repository's code and docs.

# Services

* [KTL Curator plugin](services/ktl-curator-plugin.md) - The Obsidian plugin entry point - scans configured bundle roots via metadataCache, computes and caches a trust report per bundle, owns the one-concept-at-a-time review session (curator-id modal, the five verdict verbs, the mtime guard on "corrected"), and exposes the Step 3 commands. With no bundle root configured or detected, and the break-glass "treat vault root as bundle" setting off, the vault has no bundle at all - no report, no queue, nothing written.
* [Trust engine](services/trust-engine.md) - Pure, import-free modules computing one concept's trust record, the bundle's seven health counts, and the ranked "worth ten minutes today" queue from already-parsed frontmatter and headings.
* [Edits engine](services/edits-engine.md) - Pure string and object transforms for every write the review session makes: the five verbs' frontmatter and body edits, the log.md Curation and Deprecation lines, the repeated send-back hint, and the two Step-3 templates.
* [Curator side panel](services/curator-view.md) - The "Curate" ItemView - the read-only trust report (health chips, ranked queue, open questions, active-note card) and the one-concept-at-a-time review card (evidence-first: source, claim, current trust, then the question).
* [Settings tab](services/settings-tab.md) - The declarative Obsidian settings tab (1.13+): curator id, the two in-editor toggles, bundle scope, the known type vocabulary, review intervals, queue size, and the feedback file path.
* [In-editor aids](services/in-editor-aids.md) - Three Settings → In-editor conveniences while a curator hand-edits a concept's raw frontmatter - a searchable "Look up a LOKF field" command, a live trust-tier badge on the frontmatter (Source mode only), and autocomplete for the values a curator hand-types (the human:<id> actor, status, and at/stale_after dates) - plus the shared trust-tier label vocabulary they and the status bar all render identically.

# References

* [LOKF specification](references/lokf-specification.md) - The Linked Open Knowledge Format specification - the semantic profile of OKF this plugin's trust labels and typed relations are defined against.
* [OKF v0.2 specification](references/okf-specification.md) - The Open Knowledge Format specification LOKF profiles - one concept per Markdown file, provenance/trust/lifecycle fields, permissive consumption.
* [lokf toolkit (PyPI)](references/lokf-toolkit.md) - The Python package that this repository's own .lokf/ sidecar uses to validate the bundle, check its relation targets and convert it to RDF. The plugin never uses it at runtime, and only the scripts/build-vocab.mjs maintenance step reads its schema.
* [Obsidian plugin developer guidelines](references/obsidian-plugin-guidelines.md)
* [Trust fields (ktl-curator skill)](references/trust-fields.md) - The exact rule for each plain-language trust label: the spec of record that trust-engine.md implements, and the source that the health-line chips in docs/using.md and the label table in docs/for-the-curious.md summarize.
* [Review session (ktl-curator skill)](references/review-session.md)

# Glossary

* [OKF](glossary/okf.md) - What OKF, the Open Knowledge Format, means: a folder of Markdown files, one concept to a file, each with YAML frontmatter whose only required key is type. LOKF profiles it.
* [LOKF](glossary/lokf.md) - What LOKF, the Linked Open Knowledge Format, means: a semantic profile of OKF that binds every field and relationship to a public vocabulary, so a bundle turns into a knowledge graph that SPARQL can query.
* [Diátaxis genre](glossary/diataxis-genre.md) - What the optional LOKF genre field means: the Diátaxis mode (tutorial, how-to, reference or explanation) that says how a concept's body serves the reader, separate from its type.

# Policies

* [No network access, no telemetry](policies/no-telemetry.md) - The plugin makes no network requests and has no telemetry, remote code or external services: it reads the Markdown in the open vault and writes only through the five review verbs and the two file-creating commands, each on a button press.

# Explanation

* [Why KTL Curator exists](explanation/why-ktl-curator.md) - Where this plugin sits on the four-tier trust model, and why it is the sibling of ktl-registrar rather than a superset or a dependency of it.

# Playbooks

* [Knowledge sources](playbooks/knowledge-sources.md) - Where this bundle's concepts are derived from, and how to re-check each source on a later librarian run.
* [Releasing a new version](playbooks/releasing.md) - Semantic-release computes the version and promotes CHANGELOG.md on a merge to main, behind the release Environment; release.yml then builds, attests and opens a draft release, from semantic-release's call, a hand-pushed tag, or a hand-run dispatch.
* [Contributing to the plugin](playbooks/contributing.md) - Development setup, npm run check (build, lint and smoke test, the same three steps CI's build.yml runs), the seven pure modules the smoke test covers, and the pull-request checklist: verb write limits, the changelog line, sibling links, the vocab refresh, the skills pin sync and releasing pull request titles.
* [Knowledge registrar gate](playbooks/knowledge-registrar-gate.md) - The knowledge-registrar.yaml workflow: validates the bundle and its relation targets on every pull request that touches it, and ties every human: confirmation a pull request adds, changes or removes to that person's approval of the pull request or their verified signature on the commit, with an environment reviewer's attestation as the fallback.
* [Knowledge website](playbooks/knowledge-website.md) - The website/ folder and the knowledge-website.yaml workflow: an Astro Starlight site built from the bundle, the README, docs/ and the changelog, with a trust label on every concept page, built on pull requests and published to GitHub Pages at `https://noelmcloughlin.github.io/obsidian-ktl-curator/` once the repository variable KNOWLEDGE_WEBSITE_ENABLED is true.
