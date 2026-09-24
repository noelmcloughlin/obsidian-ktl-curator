---
type: Policy
id: https://ktl-curator.example/knowledge/policies/no-telemetry
title: No network access, no telemetry
description: The plugin makes no network requests and has no telemetry, analytics, or external services of any kind - reads Markdown in the open vault, writes only through the five review verbs and the two Step-3 commands.
resource: SECURITY.md
about:
  - https://ktl-curator.example/knowledge/services/ktl-curator-plugin
generated:
  by: process:ktl-librarian
  at: "2026-09-10T00:00:00Z"
status: draft
verified:
  - by: process:ktl-librarian
    at: "2026-09-14T16:26:10Z"
---

Stated in `SECURITY.md` ("The plugin" section, kept even after the
2026-09-14 rewrite that slimmed the rest of the file to a policy plus a link
to the skills repository's shared threat model) and `README.md`'s Privacy
section. Every write is something a person explicitly asked for by pressing
a verb button or running a command - there is no background write path.
