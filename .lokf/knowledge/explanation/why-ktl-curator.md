---
type: Explanation
id: https://ktl-curator.example/knowledge/explanation/why-ktl-curator
title: Why KTL Curator exists
description: Where this plugin sits on the four-tier trust model, and why it is the sibling of ktl-registrar rather than a superset or a dependency of it.
genre: explanation
resource: docs/for-the-curious.md
about:
- https://ktl-curator.example/knowledge/services/ktl-curator-plugin
relatedTo:
- https://ktl-curator.example/knowledge/policies/no-telemetry
generated:
  by: process:ktl-librarian
  at: "2026-10-15T23:47:44Z"
status: draft
verified:
- by: process:ktl-librarian
  at: "2026-10-15T23:47:44Z"
---

The companion `knowledge-trust-ladder` project describes four levels of trust a claim in a bundle can earn: schema-valid, source-consistent, human-confirmed and proven-in-use. Each proves less than its name suggests, and only the third yields a claim someone has agreed to stand behind.

Schema validation is KTL Registrar's, a separate plugin at the tier below. This plugin is the human-confirmed tier in the editor: the `ktl-curator` skill's review session, available without an agent in the loop.

The plugin checks no claim against its source itself. It puts the source beside the claim, asks the person, and proposes no correction. Deriving concepts from a repository is the librarian's job.

This plugin never loads or calls a skill, an agent or another plugin. KTL Registrar is equally independent: neither plugin detects whether the other is installed.

`docs/for-the-curious.md` says this under "Where this fits: the human-confirmed tier" and "What this plugin leaves to others". `docs/architecture.md` links to that page; `README.md` no longer does.
