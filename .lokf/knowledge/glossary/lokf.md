---
type: GlossaryTerm
id: https://ktl-curator.example/knowledge/glossary/lokf
title: LOKF
abbreviation: LOKF
definition: Linked Open Knowledge Format - a semantic profile of OKF where every field and relationship is bound to a public vocabulary (schema.org / DCAT / PROV-O), so a bundle can be losslessly turned into a knowledge graph and queried with SPARQL.
definedBy:
  - https://ktl-curator.example/knowledge/references/lokf-specification
relatedTo:
  - https://ktl-curator.example/knowledge/glossary/okf
generated:
  by: process:ktl-librarian
  at: "2026-09-10T00:00:00Z"
status: draft
verified:
  - by: process:ktl-librarian
    at: "2026-09-12T22:00:00Z"
---

This plugin's trust labels and the ten typed-relation fields (`isPartOf`,
`dependsOn`, etc.) are the LOKF-specific surface `trust-engine.md` computes
over - schema validation of the LOKF layer itself is `ktl-registrar`'s job,
not this plugin's.
