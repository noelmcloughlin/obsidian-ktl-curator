# Change Log

## 2026-09-10

* **Bootstrap discovery**: replaced the two placeholder services with 5 `Service` concepts (`lokf-curator-plugin`, `trust-engine`, `edits-engine`, `curator-view`, `settings-tab`) derived from `src/*.ts`; added 6 `Reference` concepts (the LOKF/OKF specs, the `lokf` toolkit, Obsidian's plugin guidelines, and the `lokf-curator` skill's `trust-fields.md`/`review-session.md`); 3 `GlossaryTerm` concepts (OKF, LOKF, Diátaxis genre); 1 `Policy` (no-telemetry); 1 `Explanation` (why LOKF Curator exists); and `playbooks/knowledge-sources.md` recording where each of these came from, plus `playbooks/releasing.md` and `playbooks/contributing.md` from `CONTRIBUTING.md`. All 17 new concepts are `status: draft`, none yet confirmed by a person.
* **Initialization**: Scaffolded the LOKF bundle for LOKF Curator with placeholder
  services. Real concepts to follow.
