---
type: Policy
id: https://lokf-curator.example/knowledge/policies/no-telemetry
title: No network access, no telemetry
description: The plugin makes no network requests and has no telemetry, analytics, or external services of any kind - reads Markdown in the open vault, writes only through the five review verbs and the two Step-3 commands.
resource: SECURITY.md
about:
  - https://lokf-curator.example/knowledge/services/lokf-curator-plugin
generated:
  by: process:lokf-librarian
  at: "2026-09-10T00:00:00Z"
status: draft
---

Stated in `SECURITY.md` ("The plugin" section) and `README.md`'s Privacy
section. Every write is something a person explicitly asked for by pressing
a verb button or running a command - there is no background write path.
