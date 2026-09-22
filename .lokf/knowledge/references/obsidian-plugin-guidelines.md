---
type: Reference
id: https://ktl-curator.example/knowledge/references/obsidian-plugin-guidelines
title: Obsidian plugin developer guidelines
description: The platform API surface and review guidelines this plugin is built against - declarative settings (1.13+), processFrontMatter, metadataCache, and the eslint-plugin-obsidianmd ruleset that encodes them.
genre: reference
resource: https://docs.obsidian.md/Plugins
generated:
  by: process:ktl-librarian
  at: "2026-09-13T19:00:00Z"
status: draft
verified:
  - by: process:ktl-librarian
    at: "2026-09-14T15:30:00Z"
---

`manifest.json` sets `minAppVersion: 1.13.0` because `settings-tab.md`'s
declarative `getSettingDefinitions()` API requires it. `CONTRIBUTING.md`
treats `eslint-plugin-obsidianmd` findings as review feedback from this
authority, not style noise.
