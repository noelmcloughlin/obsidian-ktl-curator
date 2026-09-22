---
type: Reference
id: https://ktl-curator.example/knowledge/references/lokf-toolkit
title: lokf toolkit (PyPI)
description: The Python package this repository's own .lokf/ sidecar depends on for schema validation, SHACL checks, and RDF conversion - not something the Obsidian plugin itself uses at runtime.
genre: reference
resource: https://pypi.org/project/lokf/
derivedFrom:
  - https://ktl-curator.example/knowledge/references/lokf-specification
generated:
  by: process:ktl-librarian
  at: "2026-09-13T19:00:00Z"
status: draft
verified:
  - by: process:ktl-librarian
    at: "2026-09-12T22:00:00Z"
---

Declared in `.lokf/pyproject.toml`; `just lokf-validate` (from `.lokf/`) runs
its generated JSON Schema and SHACL checks against this bundle. Unrelated to
the plugin's own build (`npm run build`) - the plugin never imports Python
or calls into this toolkit; it is this repository's own documentation
tooling only.
