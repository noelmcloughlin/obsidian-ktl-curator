---
type: Reference
id: https://w3id.org/ktl/curator/knowledge/references/trust-fields
title: Trust fields (ktl-curator skill)
description: "The exact rule for each plain-language trust label: the spec of record that trust-engine.md implements, and the source that the health-line chips in docs/using.md and the label table in docs/for-the-curious.md summarize."
genre: reference
resource: https://github.com/noelmcloughlin/knowledge-trust-ladder/blob/main/skills/ktl-curator/references/trust-fields.md
about:
  - https://w3id.org/ktl/curator/knowledge/references/lokf-specification
generated:
  by: process:ktl-librarian
  at: "2026-10-18T13:38:52Z"
status: draft
verified:
  - by: process:ktl-librarian
    at: "2026-10-16T23:47:52Z"
isPartOf:
  - https://w3id.org/ktl/knowledge/playbooks/ktl-curator-skill
---

This reference maps each human-facing label ("confirmed by a person", "past its review date", ...) onto its field in OKF v0.2 §5 and LOKF Golden Rule 6. It includes the parsing edge cases `src/trust.ts` handles:

- a bare `verified` mapping, read as a one-element list;
- an exact `## Open questions` heading, never a substring match;
- cross-bundle relation-target resolution.

A local install puts it at `.agents/skills/ktl-curator/references/trust-fields.md`. That path is gitignored, per `.gitignore`'s "installed agent skills are runtime state" note. The reference is not part of the plugin's own source, but the plugin's implementation must not drift from it.

## Open questions

None. The 2026-09-14 question - whether the plugin was ahead of its pinned
spec of record on "known" versus "built-in vocabulary" - is settled: the pin
moved from `v0.9.0` to `v0.19.2` on 2026-09-18, and that release carries the
"known vocabulary" wording `src/curator-view.ts` uses, so the plugin and its
pinned resource agree.
