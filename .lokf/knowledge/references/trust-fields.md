---
type: Reference
id: https://lokf-curator.example/knowledge/references/trust-fields
title: Trust fields (lokf-curator skill)
description: The exact rule for each plain-language trust label - the spec of record trust-engine.md implements, and the source the README's health-line chips and docs/for-the-curious.md's label table summarize.
genre: reference
resource: https://github.com/noelmcloughlin/knowledge-trust-ladder/blob/v0.19.2/skills/lokf-curator/references/trust-fields.md
about:
  - https://lokf-curator.example/knowledge/references/lokf-specification
generated:
  by: process:lokf-librarian
  at: "2026-09-18T11:00:00Z"
status: draft
verified:
  - by: process:lokf-librarian
    at: "2026-09-18T11:00:00Z"
---

Maps each human-facing label ("confirmed by a person", "past its review
date", ...) onto its OKF v0.2 §5 / LOKF Golden Rule 6 field, including the
parsing edge cases `src/trust.ts` handles: a bare `verified` mapping read as
a one-element list, an exact `## Open questions` heading (never a substring
match), and cross-bundle relation-target resolution. Installed locally at
`.agents/skills/lokf-curator/references/trust-fields.md` (gitignored, per
`.gitignore`'s "installed agent skills are runtime state" note) - not part
of the plugin's own source, but the plugin's implementation must not drift
from it.

## Open questions

None. The 2026-09-14 question - whether the plugin was ahead of its pinned
spec of record on "known" versus "built-in vocabulary" - is settled: the pin
moved from `v0.9.0` to `v0.19.2` on 2026-09-18, and that release carries the
"known vocabulary" wording `src/curator-view.ts` uses, so the plugin and its
pinned resource agree.
