# Change Log

## 2026-09-12 (3)

* **Sibling renamed** (maintainer decision, upstream): LOKF Enforcer is now
  **LOKF Registrar** (`lokf-registrar`, repository `obsidian-lokf-registrar`),
  renamed for its role before either plugin was published.
  `explanation/why-lokf-curator.md` (description now says *sibling*, `generated`
  refreshed), `glossary/lokf.md`, `references/okf-specification.md`,
  `services/settings-tab.md`, `services/trust-engine.md`, and
  `playbooks/knowledge-sources.md` name it so. No relationship changed:
  siblings, no dependency either way. Entries below keep the name in use at
  the time.

## 2026-09-12 (2)

* **Corrected** `services/lokf-curator-plugin.md` and `services/settings-tab.md`
  after the maintainer had the afternoon's recommendations implemented: with
  no bundle roots configured a top-level `knowledge_bundle/` is detected on
  its own (`autoBundleRoot`, identical to LOKF Enforcer's), and a dot-folder
  root is accepted with a live-index check and a warning instead of refused.

* **README restructured** around how an Obsidian user meets a knowledge
  bundle - a new "How this fits into an Obsidian vault" section (the bundle
  is the vault; a folder inside the vault; derived from a repository and
  opened through `knowledge_bundle`), where the `lokf-agent-skills` come in,
  and why a vault is never migrated into a bundle. Corrected the previous
  README's claim that a repository root opened as a vault reaches the bundle
  through the `knowledge_bundle` link: per Obsidian's own help on symbolic
  links, a link whose target is inside the same vault is ignored, and a
  dot-folder is never indexed. Other OKF validators are now mentioned once,
  in an "Alternative plugins" footnote. No concept body changed:
  `explanation/why-lokf-curator.md` already describes the relationship to
  LOKF Enforcer correctly (siblings, no dependency either way). The upstream
  skill this bundle cites as `lokf-scaffolding` is now `lokf-sidecar`
  (`playbooks/knowledge-sources.md` updated). Targeted pass, not a full
  steady-state sweep.

## 2026-09-10

* **Bootstrap discovery**: replaced the two placeholder services with 5 `Service` concepts (`lokf-curator-plugin`, `trust-engine`, `edits-engine`, `curator-view`, `settings-tab`) derived from `src/*.ts`; added 6 `Reference` concepts (the LOKF/OKF specs, the `lokf` toolkit, Obsidian's plugin guidelines, and the `lokf-curator` skill's `trust-fields.md`/`review-session.md`); 3 `GlossaryTerm` concepts (OKF, LOKF, Diátaxis genre); 1 `Policy` (no-telemetry); 1 `Explanation` (why LOKF Curator exists); and `playbooks/knowledge-sources.md` recording where each of these came from, plus `playbooks/releasing.md` and `playbooks/contributing.md` from `CONTRIBUTING.md`. All 17 new concepts are `status: draft`, none yet confirmed by a person.
* **Initialization**: Scaffolded the LOKF bundle for LOKF Curator with placeholder
  services. Real concepts to follow.
