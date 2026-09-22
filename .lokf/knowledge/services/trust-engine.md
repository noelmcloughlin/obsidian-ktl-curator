---
type: Service
id: https://ktl-curator.example/knowledge/services/trust-engine
title: Trust engine
description: Pure, import-free modules computing one concept's trust record, the bundle's seven health counts, and the ranked "worth ten minutes today" queue from already-parsed frontmatter and headings.
resource: src/trust.ts
isPartOf:
  - https://ktl-curator.example/knowledge/services/ktl-curator-plugin
dependsOn:
  - https://ktl-curator.example/knowledge/references/trust-fields
generated:
  by: process:ktl-librarian
  at: "2026-09-14T09:30:00Z"
status: draft
verified:
  - by: process:ktl-librarian
    at: "2026-09-14T09:30:00Z"
---

# Overview

`src/bundle.ts` and `src/trust.ts` together compute every trust label
`references/trust-fields.md` (the `ktl-curator` skill) defines, as pure
functions with no Obsidian dependency and no `Date.now()` - `today` is always
a parameter, so every date-dependent label is reproducible under plain Node
(`scripts/smoke-test.ts`).

- `bundle.ts` - carried over from the sibling `ktl-registrar` plugin: bundle-root resolution (`normalizeBundleRoots`, `resolveBundleRoot`), frontmatter split, relation-target resolution, and the class check (`classify`) - against the pinned manifest's fifteen classes (`KNOWN_LOKF_TYPES`, `Role` included), or, since 2026-09-14, whatever list is handed in from the settings tab's *Known LOKF types*. `HARDCODED_LOKF_TYPES` keeps the pre-schema fourteen for the settings refresh rule; `SCHEMA_VERSION` exposes the manifest's version.
- `trust.ts` - `buildTrustRecord` turns one concept's frontmatter + heading list into a `TrustRecord` (its `TrustInputs` may carry `knownTypes`, which `classify` receives); `computeReliedOnBy` does the second pass over every concept's ten relation fields plus `relations[].target` to fill in "N other concepts rely on this"; `computeHealth` produces the seven (overlapping, not partitioned) counts; `rankQueue` orders the queue by the skill's four ranking groups, then by reliance count, then by newest `generated.at` - the class check never enters the ranking. `parseCurationPolicyTable(body, knownTypes)` honours a `policies/knowledge-curation.md` row only for a class in the list it is given, so a listed domain class can carry an interval of its own; `monthsForClass` falls back to 12 months for a class no group or row names. That table is prose a person writes, so since 2026-09-14 the match ignores spaces and English plurals (`policyRowForms`): "Glossary terms" binds `GlossaryTerm`, "people" binds `Person`. Matching literally before that, it silently ignored four rows of the plugin's own template, whose intervals happened to coincide with the settings defaults.
