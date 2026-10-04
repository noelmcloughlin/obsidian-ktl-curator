---
lokf_version: "0.2"
okf_version: "0.2"
base_iri: https://ktl-curator.example/knowledge/
context: https://w3id.org/lokf/context.jsonld
title: KTL Curator Knowledge Bundle
description: "Help a person judge what a LOKF knowledge bundle claims: a trust report computed from frontmatter, and a review session that records confirm, send back, and retire verdicts in the bundle itself"
license: https://creativecommons.org/licenses/by/4.0/
publisher:
  type: Person
  id: https://ktl-curator.example/knowledge/person/noel-mcloughlin
  name: Noel McLoughlin
---

# KTL Curator Knowledge Bundle

A [LOKF](https://lokf.nolan-nichols.com) knowledge base for KTL Curator. Every Markdown file under `knowledge/` is one concept; together they form a queryable knowledge graph, derived from this repository's code and docs.

# Services

* [KTL Curator plugin](services/ktl-curator-plugin.md) - The Obsidian plugin entry point - scans configured bundle roots via metadataCache, computes and caches a trust report per bundle, owns the one-concept-at-a-time review session (curator-id modal, the five verdict verbs, the mtime guard on "corrected"), and exposes the Step 3 commands. With no bundle root configured or detected, and the break-glass "treat vault root as bundle" setting off, the vault has no bundle at all - no report, no queue, nothing written.
* [Trust engine](services/trust-engine.md) - Pure, import-free modules computing one concept's trust record, the bundle's seven health counts, and the ranked "worth ten minutes today" queue from already-parsed frontmatter and headings.
* [Edits engine](services/edits-engine.md) - Pure string/object transforms for every write the review session makes - the five verbs' frontmatter and body edits, the log.md upsert, and the two Step-3 templates.
* [Curator side panel](services/curator-view.md) - The "Curate" ItemView - the read-only trust report (health chips, ranked queue, open questions, active-note card) and the one-concept-at-a-time review card (evidence-first: source, claim, current trust, then the question).
* [Settings tab](services/settings-tab.md) - The declarative Obsidian settings tab (1.13+) - curator id, bundle scope, the known type vocabulary, review intervals, queue size, and the feedback file path.
* [In-editor aids](services/in-editor-aids.md) - Three Settings → In-editor conveniences while a curator hand-edits a concept's raw frontmatter - a searchable "Look up a LOKF field" command, a live trust-tier badge on the frontmatter (Source mode only), and autocomplete for the values a curator hand-types (the human:<id> actor, status, and at/stale_after dates) - plus the shared trust-tier label vocabulary they and the status bar all render identically.

# References

* [LOKF specification](references/lokf-specification.md)
* [OKF v0.2 specification](references/okf-specification.md)
* [lokf toolkit (PyPI)](references/lokf-toolkit.md)
* [Obsidian plugin developer guidelines](references/obsidian-plugin-guidelines.md)
* [Trust fields (ktl-curator skill)](references/trust-fields.md)
* [Review session (ktl-curator skill)](references/review-session.md)

# Glossary

* [OKF](glossary/okf.md)
* [LOKF](glossary/lokf.md)
* [Diátaxis genre](glossary/diataxis-genre.md)

# Policies

* [No network access, no telemetry](policies/no-telemetry.md)

# Explanation

* [Why KTL Curator exists](explanation/why-ktl-curator.md)

# Playbooks

* [Knowledge sources](playbooks/knowledge-sources.md) - Where this bundle's concepts are derived from, and how to re-check each source on a later librarian run.
* [Releasing a new version](playbooks/releasing.md)
* [Contributing to the plugin](playbooks/contributing.md)
* [Knowledge registrar gate](playbooks/knowledge-registrar-gate.md) - The knowledge-registrar.yaml workflow - validates the bundle on every pull request that touches it, and ties every newly added human: confirmation (the event this plugin's Confirm verb writes) to evidence GitHub holds - that person's approval of the pull request, or their verified signature on the commit that introduced it - with an environment-reviewer attestation as the escape hatch for a repository that cannot sign.
