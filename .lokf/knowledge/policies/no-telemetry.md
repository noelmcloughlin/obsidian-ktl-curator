---
type: Policy
id: https://ktl-curator.example/knowledge/policies/no-telemetry
title: No network access, no telemetry
description: "The plugin makes no network requests and has no telemetry, remote code or external services: it reads the Markdown in the open vault and writes only through the five review verbs and the two file-creating commands, each on a button press."
resource: SECURITY.md
about:
- https://ktl-curator.example/knowledge/services/ktl-curator-plugin
generated:
  by: process:ktl-librarian
  at: "2026-10-15T23:47:44Z"
status: draft
verified:
- by: process:ktl-librarian
  at: "2026-10-15T23:47:44Z"
sources:
- resource: SECURITY.md
- resource: docs/architecture.md
---

`SECURITY.md` states this policy in its "The plugin" section. KTL Curator runs inside Obsidian, on the vault you open it in, and nowhere else. It makes no outward call and loads nothing while it runs: no network, no telemetry, no remote code. It reads the vault to compute trust labels, and writes only through the five review verbs and the two file-creating commands, each on a button press.

`docs/architecture.md` says the same under Privacy: no network requests, no telemetry, no external services. The two file-creating commands are **Create curation policy** and **Record something missing**, and every write is one you asked for by pressing a button. Settings, including the curator id, live in the vault's own plugin data.
