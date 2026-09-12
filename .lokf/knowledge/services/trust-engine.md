---
type: Service
id: https://lokf-curator.example/knowledge/services/trust-engine
title: Trust engine
description: Pure, import-free modules computing one concept's trust record, the bundle's seven health counts, and the ranked "worth ten minutes today" queue from already-parsed frontmatter and headings.
resource: src/trust.ts
isPartOf:
  - https://lokf-curator.example/knowledge/services/lokf-curator-plugin
dependsOn:
  - https://lokf-curator.example/knowledge/references/trust-fields
generated:
  by: process:lokf-librarian
  at: "2026-09-10T00:00:00Z"
status: draft
---

# Overview

`src/bundle.ts` and `src/trust.ts` together compute every trust label
`references/trust-fields.md` (the `lokf-curator` skill) defines, as pure
functions with no Obsidian dependency and no `Date.now()` - `today` is always
a parameter, so every date-dependent label is reproducible under plain Node
(`scripts/smoke-test.ts`).

- `bundle.ts` - carried over from the sibling `lokf-registrar` plugin: bundle-root resolution (`normalizeBundleRoots`, `resolveBundleRoot`), frontmatter split, relation-target resolution, and the 14-class check (`classify`).
- `trust.ts` - `buildTrustRecord` turns one concept's frontmatter + heading list into a `TrustRecord`; `computeReliedOnBy` does the second pass over every concept's ten relation fields plus `relations[].target` to fill in "N other concepts rely on this"; `computeHealth` produces the seven (overlapping, not partitioned) counts; `rankQueue` orders the queue by the skill's four ranking groups, then by reliance count, then by newest `generated.at`.
