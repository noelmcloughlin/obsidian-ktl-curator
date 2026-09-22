---
type: GlossaryTerm
id: https://ktl-curator.example/knowledge/glossary/okf
title: OKF
abbreviation: OKF
definition: Open Knowledge Format - a folder of Markdown files, one idea per file, each starting with a small YAML frontmatter block whose only strict requirement is a type. Permissive by design; missing optional fields never cause rejection.
definedBy:
  - https://ktl-curator.example/knowledge/references/okf-specification
generated:
  by: process:ktl-librarian
  at: "2026-09-10T00:00:00Z"
status: draft
verified:
  - by: process:ktl-librarian
    at: "2026-09-12T22:00:00Z"
---

The format LOKF (below) profiles. This plugin reads OKF's provenance/trust/lifecycle fields (`generated`, `verified`, `status`, `stale_after`) to compute trust labels, and never validates OKF schema conformance itself.
