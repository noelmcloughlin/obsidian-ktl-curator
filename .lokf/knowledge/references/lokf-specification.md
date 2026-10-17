---
type: Reference
id: https://w3id.org/ktl/curator/knowledge/references/lokf-specification
title: LOKF specification
description: The Linked Open Knowledge Format specification - the semantic profile of OKF this plugin's trust labels and typed relations are defined against.
genre: reference
resource: https://lokf.nolan-nichols.com/specification/
derivedFrom:
- https://w3id.org/ktl/curator/knowledge/references/okf-specification
generated:
  by: process:ktl-librarian
  at: "2026-10-16T23:47:52Z"
status: draft
verified:
- by: process:ktl-librarian
  at: "2026-10-16T23:47:52Z"
---

This page is the canonical source for what LOKF means. It holds the type vocabulary, the ten typed-relation fields, and the OKF v0.2 §5.4 provenance, trust and lifecycle field families that this plugin computes trust labels from (`trust-engine.md`). Its type table lists fourteen classes and names `lokf.yaml` as the complete definition. The `lokf.yaml` of the 0.8.0 toolkit also declares `Role`, so the plugin's `src/lokf-vocab.json` lists fifteen.

Its authority lies outside this repository. When a claim about the spec itself is in question, cite this page, not a paraphrase.
