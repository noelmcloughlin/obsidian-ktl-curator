---
type: Service
id: https://w3id.org/ktl/curator/knowledge/services/trust-engine
title: Trust engine
description: Pure, import-free modules computing one concept's trust record, the bundle's seven health counts, and the ranked "worth ten minutes today" queue from already-parsed frontmatter and headings.
resource: src/trust.ts
isPartOf:
- https://w3id.org/ktl/curator/knowledge/services/ktl-curator-plugin
dependsOn:
- https://w3id.org/ktl/curator/knowledge/references/trust-fields
generated:
  by: process:ktl-librarian
  at: "2026-10-15T23:47:44Z"
status: draft
verified:
- by: process:ktl-librarian
  at: "2026-10-15T23:47:44Z"
---

# Overview

`src/bundle.ts` and `src/trust.ts` together compute every trust label that `references/trust-fields.md` (the `ktl-curator` skill) defines. They are pure functions with no Obsidian dependency and no `Date.now()`. `today` is always a parameter, so every date-dependent label is reproducible under plain Node (`scripts/smoke-test.ts`).

- `bundle.ts` is carried over from the sibling `ktl-registrar` plugin. It holds bundle-root resolution (`normalizeBundleRoots`, `resolveBundleRoot`), the frontmatter split, relation-target resolution, and the class check (`classify`). The class check runs against the pinned manifest's fifteen classes (`KNOWN_LOKF_TYPES`, `Role` included), or, since 2026-09-14, against whatever list is handed in from the settings tab's *Known LOKF types*. `HARDCODED_LOKF_TYPES` keeps the pre-schema fourteen for the settings refresh rule; `SCHEMA_VERSION` exposes the manifest's version.
- In `trust.ts`, `buildTrustRecord` turns one concept's frontmatter + heading list into a `TrustRecord`. Its `TrustInputs` may carry `knownTypes`, which `classify` receives. A concept reads as unchecked when its `verified` holds no events, so `verified: []` and a bare `verified:` count as nobody has checked. It reads as checked by automation only when its events hold none by a `human:` actor.
- `computeReliedOnBy` does the second pass over every concept's relation fields plus `relations[].target`, to fill in "N other concepts rely on this". The relation fields are `RELATION_FIELDS` in `bundle.ts`: the thirteen slots the pinned schema ranges over `Concept`, read from the manifest, with `HARDCODED_RELATION_FIELDS` as the fallback. Each relying concept counts once. A retired concept counts for none and is counted for none, the rule `knowledge-report.sh` applies.
- `computeHealth` produces the seven counts, which overlap rather than partition.
- `rankQueue` orders the queue by the skill's four ranking groups, then by reliance count, then by newest `generated.at`. The class check never enters the ranking.
- `parseCurationPolicyTable(body, knownTypes)` honours a `policies/knowledge-curation.md` row only for a class in the list it is given, so a listed domain class can carry an interval of its own. `monthsForClass` falls back to 12 months for a class no group or row names. That table is prose a person writes, so since 2026-09-14 the match ignores spaces and English plurals (`policyRowForms`): "Glossary terms" binds `GlossaryTerm`, "people" binds `Person`. Before that the match was literal, and it silently ignored four rows of the plugin's own template, whose intervals happened to coincide with the settings defaults.
