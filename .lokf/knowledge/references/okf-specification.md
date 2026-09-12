---
type: Reference
id: https://lokf-curator.example/knowledge/references/okf-specification
title: OKF v0.2 specification
description: The Open Knowledge Format specification LOKF profiles - one concept per Markdown file, provenance/trust/lifecycle fields, permissive consumption.
genre: reference
resource: https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/main/okf/SPEC.md
sameAs:
  - https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/main/okf/SPEC.md
derivedFrom:
  - https://lokf-curator.example/knowledge/references/lokf-specification
generated:
  by: process:lokf-librarian
  at: "2026-09-10T00:00:00Z"
status: draft
verified:
  - by: process:lokf-librarian
    at: "2026-09-12T22:00:00Z"
---

Defines `generated`, `verified`, `sources`, `usage_window`, `status`, and
`stale_after` - the fields `trust-engine.md` (`src/trust.ts`) reads to
compute every trust label. This plugin does not validate OKF or LOKF schema
conformance itself (that is `lokf-registrar`); it only reads these fields.
