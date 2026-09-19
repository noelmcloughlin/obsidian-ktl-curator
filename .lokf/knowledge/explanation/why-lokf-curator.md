---
type: Explanation
id: https://lokf-curator.example/knowledge/explanation/why-lokf-curator
title: Why LOKF Curator exists
description: Where this plugin sits on the four-tier trust model, and why it is the sibling of lokf-registrar rather than a superset or a dependency of it.
genre: explanation
resource: docs/for-the-curious.md
about:
  - https://lokf-curator.example/knowledge/services/lokf-curator-plugin
relatedTo:
  - https://lokf-curator.example/knowledge/policies/no-telemetry
generated:
  by: process:lokf-librarian
  at: "2026-09-12T22:00:00Z"
status: draft
verified:
  - by: process:lokf-librarian
    at: "2026-09-14T09:30:00Z"
---

The companion `knowledge-trust-ladder` project describes four trust tiers a claim
can earn: schema-valid, source-consistent, human-confirmed, proven-in-use.
`lokf-registrar` (a separate plugin) checks the first tier as you write. This
plugin is the in-editor counterpart of the **human-confirmed** tier - the
`lokf-curator` skill's review session, available without an agent in the
loop. It decides nothing and verifies nothing against a source itself; it
puts the source next to the claim and records only what a named person
explicitly says. Neither plugin depends on the other, and neither detects
whether the other is installed - see `docs/for-the-curious.md` "Where this
fits: the human-confirmed tier" (moved out of `README.md`, which now only
links to it from its own "For the curious" section).
