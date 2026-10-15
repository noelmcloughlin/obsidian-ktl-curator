---
type: Reference
id: https://ktl-curator.example/knowledge/references/okf-specification
title: OKF v0.2 specification
description: The Open Knowledge Format specification LOKF profiles - one concept per Markdown file, provenance/trust/lifecycle fields, permissive consumption.
genre: reference
resource: https://github.com/GoogleCloudPlatform/open-knowledge-format/blob/main/SPEC.md
generated:
  by: process:ktl-librarian
  at: "2026-10-15T23:54:07Z"
status: draft
verified:
- by: process:ktl-librarian
  at: "2026-10-15T23:54:07Z"
---

Defines `generated`, `verified`, `sources`, `usage_window`, `status`, and
`stale_after` - the fields `trust-engine.md` (`src/trust.ts`) reads to
compute every trust label. This plugin does not validate OKF or LOKF schema
conformance itself (that is `ktl-registrar`); it only reads these fields.
