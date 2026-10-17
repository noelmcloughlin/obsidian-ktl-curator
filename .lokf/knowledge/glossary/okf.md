---
type: GlossaryTerm
id: https://w3id.org/ktl/curator/knowledge/glossary/okf
title: OKF
abbreviation: OKF
definition: Open Knowledge Format - a folder of Markdown files, one idea per file, each starting with a small YAML frontmatter block whose only strict requirement is a type. Permissive by design; missing optional fields never cause rejection.
definedBy:
- https://w3id.org/ktl/curator/knowledge/references/okf-specification
generated:
  by: process:ktl-librarian
  at: "2026-10-16T23:48:28Z"
status: draft
verified:
- by: process:ktl-librarian
  at: "2026-10-16T23:48:28Z"
description: "What OKF, the Open Knowledge Format, means: a folder of Markdown files, one concept to a file, each with YAML frontmatter whose only required key is type. LOKF profiles it."
---

OKF is the format that LOKF profiles. This plugin reads OKF's provenance, trust and lifecycle fields (`generated`, `verified`, `status`, `stale_after`) to compute trust labels, and never validates OKF schema conformance itself.
