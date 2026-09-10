---
type: Service
id: https://lokf-curator.example/knowledge/services/settings-tab
title: Settings tab
description: The declarative Obsidian settings tab (1.13+) - curator id, bundle scope, review intervals, queue size, and the feedback file path.
resource: src/settings.ts
isPartOf:
  - https://lokf-curator.example/knowledge/services/lokf-curator-plugin
generated:
  by: process:lokf-librarian
  at: "2026-09-10T00:00:00Z"
status: draft
---

# Overview

`LokfCuratorSettingTab` returns definitions from `getSettingDefinitions()`
rather than building DOM, which is what puts every setting into Obsidian's
settings search. Groups: **Who is curating** (curator id, validated as a
slug and refused if it contains `@`), **Scope** (bundle root folders,
excluded folders - carried over from the sibling `lokf-enforcer` plugin's
dot-folder rejection), **Review intervals** (three interval-months settings
plus "prefer policies/knowledge-curation.md when present"), **Queue**
(queue size, due-soon window), **Feedback** (the optional `feedbackFile`
path).
