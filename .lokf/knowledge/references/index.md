# References

* [LOKF specification](lokf-specification.md) - The Linked Open Knowledge Format specification - the semantic profile of OKF this plugin's trust labels and typed relations are defined against.
* [OKF v0.2 specification](okf-specification.md) - The Open Knowledge Format specification LOKF profiles - one concept per Markdown file, provenance/trust/lifecycle fields, permissive consumption.
* [lokf toolkit (PyPI)](lokf-toolkit.md) - The Python package that this repository's own .lokf/ sidecar uses to validate the bundle, check its relation targets and convert it to RDF. The plugin never uses it at runtime, and only the scripts/build-vocab.mjs maintenance step reads its schema.
* [Obsidian plugin developer guidelines](obsidian-plugin-guidelines.md)
* [Trust fields (ktl-curator skill)](trust-fields.md) - The exact rule for each plain-language trust label: the spec of record that trust-engine.md implements, and the source that the health-line chips in docs/using.md and the label table in docs/for-the-curious.md summarize.
* [Review session (ktl-curator skill)](review-session.md) - The exact frontmatter/body edit for each of the five verbs, the log.md line format, and the curation-policy and missing-placeholder templates - the spec of record edits-engine.md implements.
