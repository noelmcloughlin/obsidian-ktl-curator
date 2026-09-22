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
  at: "2026-09-12T22:00:00Z"
status: draft
verified:
  - by: process:ktl-librarian
    at: "2026-09-14T09:30:00Z"
---

The companion `knowledge-trust-ladder` project describes four trust tiers a claim
can earn: schema-valid, source-consistent, human-confirmed, proven-in-use.
`ktl-registrar` (a separate plugin) checks the first tier as you write. This
plugin is the in-editor counterpart of the **human-confirmed** tier - the
`ktl-curator` skill's review session, available without an agent in the
loop. It decides nothing and verifies nothing against a source itself; it
puts the source next to the claim and records only what a named person
explicitly says. Neither plugin depends on the other, and neither detects
whether the other is installed - see `docs/for-the-curious.md` "Where this
fits: the human-confirmed tier" (moved out of `README.md`, which now only
links to it from its own "For the curious" section).
