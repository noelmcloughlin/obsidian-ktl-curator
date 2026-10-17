---
type: GlossaryTerm
id: https://w3id.org/ktl/curator/knowledge/glossary/lokf
title: LOKF
abbreviation: LOKF
definition: Linked Open Knowledge Format - a semantic profile of OKF where every field and relationship is bound to a public vocabulary (schema.org / DCAT / PROV-O), so a bundle can be losslessly turned into a knowledge graph and queried with SPARQL.
definedBy:
- https://w3id.org/ktl/curator/knowledge/references/lokf-specification
relatedTo:
- https://w3id.org/ktl/curator/knowledge/glossary/okf
generated:
  by: process:ktl-librarian
  at: "2026-10-16T23:48:28Z"
status: draft
verified:
- by: process:ktl-librarian
  at: "2026-10-16T23:48:28Z"
sources:
- resource: src/bundle.ts
description: "What LOKF, the Linked Open Knowledge Format, means: a semantic profile of OKF that binds every field and relationship to a public vocabulary, so a bundle turns into a knowledge graph that SPARQL can query."
---

`trust-engine.md` computes over the LOKF-specific surface: this plugin's trust labels and the thirteen relation fields that `src/bundle.ts` reads from the pinned schema. They are the specification's ten typed relations, such as `isPartOf` and `dependsOn`, plus `measures`, `memberOf` and `holder`. Schema validation of the LOKF layer itself is `ktl-registrar`'s job, not this plugin's.
