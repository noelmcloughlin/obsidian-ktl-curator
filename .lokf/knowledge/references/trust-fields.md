---
type: Reference
id: https://lokf-curator.example/knowledge/references/trust-fields
title: Trust fields (lokf-curator skill)
description: The exact rule for each plain-language trust label - the spec of record trust-engine.md implements, and the source this bundle's own README trust-label table summarizes.
genre: reference
resource: .agents/skills/lokf-curator/references/trust-fields.md
about:
  - https://lokf-curator.example/knowledge/references/lokf-specification
generated:
  by: process:lokf-librarian
  at: "2026-09-10T00:00:00Z"
status: draft
verified:
  - by: process:lokf-librarian
    at: "2026-09-12T22:00:00Z"
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
