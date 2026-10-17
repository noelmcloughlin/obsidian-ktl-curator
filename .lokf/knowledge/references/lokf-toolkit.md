---
type: Reference
id: https://w3id.org/ktl/curator/knowledge/references/lokf-toolkit
title: lokf toolkit (PyPI)
description: The Python package that this repository's own .lokf/ sidecar uses to validate the bundle, check its relation targets and convert it to RDF. The plugin never uses it at runtime, and only the scripts/build-vocab.mjs maintenance step reads its schema.
genre: reference
resource: https://pypi.org/project/lokf/
derivedFrom:
- https://w3id.org/ktl/curator/knowledge/references/lokf-specification
generated:
  by: process:ktl-librarian
  at: "2026-10-16T23:47:52Z"
status: draft
verified:
- by: process:ktl-librarian
  at: "2026-10-16T23:47:52Z"
sources:
- resource: https://pypi.org/project/lokf/
- resource: .lokf/pyproject.toml
- resource: .lokf/justfile
- resource: scripts/build-vocab.mjs
---

`.lokf/pyproject.toml` declares the toolkit as `lokf[build]>=0.8.0`, and `.lokf/uv.lock` decides the version. From `.lokf/`, `just lokf-validate` runs `lokf validate`, which checks the bundle against the JSON Schema that the toolkit generates from the LOKF schema. `just lokf-check-refs` adds a check that every relation target in this bundle's own namespace names a concept in it.

The plugin never imports Python or calls into this toolkit at runtime, and `npm run build` does not use it. One maintenance step does: `scripts/build-vocab.mjs` reads the LOKF schema, `lokf.yaml`, that the pinned toolkit includes, and writes `src/lokf-vocab.json`, the static manifest the plugin includes. Its header says to re-run it, and commit the result, when the pin moves.
