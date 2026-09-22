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

* [KTL Curator plugin](services/ktl-curator-plugin.md)
* [Trust engine](services/trust-engine.md)
* [Edits engine](services/edits-engine.md)
* [Curator side panel](services/curator-view.md)
* [Settings tab](services/settings-tab.md)
* [In-editor aids](services/in-editor-aids.md)

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

* [Knowledge sources](playbooks/knowledge-sources.md)
* [Releasing a new version](playbooks/releasing.md)
* [Contributing to the plugin](playbooks/contributing.md)
* [Knowledge registrar gate](playbooks/knowledge-registrar-gate.md) - what a confirmation this plugin records must be backed by before it merges
