# Contributing to LOKF Curator

Thanks for your interest in improving LOKF Curator!

## Development setup

Node 20+ is required (CI builds on 20, 22, and 24).

```bash
git clone https://github.com/noelmcloughlin/obsidian-lokf-curator.git
cd obsidian-lokf-curator
npm install
npm run dev      # esbuild watch mode, rebuilding src/main.ts -> main.js
```

`npm run dev` watches and rebuilds; `npm run build` type-checks and produces a minified production bundle.

To test in a real vault, clone into `<your-vault>/.obsidian/plugins/lokf-curator/` directly, or symlink/copy `main.js`, `manifest.json`, and `styles.css` there, then reload Obsidian. The [Hot Reload](https://github.com/pjeby/hot-reload) plugin speeds up iteration.

### Agent skills (optional - only for editing this repo's own `.lokf/` bundle)

Nothing in the plugin depends on any agent skill, and no plugin user needs
one. The skills below concern one thing only: this repository's own
`.lokf/knowledge/` bundle, the documentation-about-this-repo that CI keeps
in step with the source. Skip this section unless you are editing that.

The bundle is maintained with [lokf-agent-skills](https://github.com/noelmcloughlin/lokf-agent-skills),
installed, never committed - `.agents/`, `.claude/`, and `skills-lock.json`
are git-ignored - and CI installs the librarian skill itself at run time. To
work on the bundle locally you need at most two, pinned to the release CI
uses (GitHub CLI 2.90+):

```bash
for s in lokf-librarian lokf-curator; do   # derive / confirm concepts
  gh skill install noelmcloughlin/lokf-agent-skills "$s@v0.9.0"
done
```

`lokf-sidecar` is only for re-generating the `.lokf/` tooling and the
two bundle workflows from their template (rare); `lokf-docent` only lets an
agent answer questions from the bundle. Neither is needed to contribute.

## Layout

Source lives in `src/`, following the upstream [obsidian-sample-plugin](https://github.com/obsidianmd/obsidian-sample-plugin) convention:

| File | Responsibility |
|---|---|
| `src/bundle.ts` | Bundle-root resolution, frontmatter split, relation-target resolution, the LOKF class check from the pinned schema manifest (plain-Node testable) |
| `src/trust.ts` | The trust-record model, health counts, ranked queue, `stale_after` derivation (import-free, plain-Node testable) |
| `src/edits.ts` | The five verbs' frontmatter/body transforms, the `log.md` upsert, the Step-3 templates (import-free, plain-Node testable) |
| `src/main.ts` | Plugin lifecycle - scanning, the review session, writes, commands |
| `src/curator-view.ts` | The "Curate" side panel: report + review card |
| `src/settings.ts` | The settings tab |

For a realistic LOKF vault to test against, point a scratch vault directly at an existing `.lokf/knowledge/` directory from a project that has one - its root `index.md` should already carry a semantic header (`base_iri`) for this plugin to mint and check ids against.

## Before opening a pull request

- Run `npm run build` - this type-checks (`tsc -noEmit`) and then bundles, so it must complete without errors.
- Run `npm run lint` - ESLint runs `eslint-plugin-obsidianmd`, which encodes Obsidian's own plugin guidelines as rules. Treat its findings as review feedback from upstream, not as style noise. `eslint.config.mts` carries two deliberate exceptions, both about vocabulary, so OKF/LOKF class names are treated as proper nouns (and `http_method`/`lokf:Concept` keep their spec-mandated casing); `scripts/` is treated as Node tooling that never ships in the bundle. Prefer fixing the code over widening either list.
- The settings tab is **declarative**: it returns definitions from `getSettingDefinitions()` and never builds DOM, which is what puts every setting into Obsidian's settings search. That API is 1.13.0-only, which is why `manifest.json` sets `minAppVersion` to 1.13.0; the imperative `display()` is deprecated and must not come back. Settings backed by a list (the comma-separated ones) are joined and split in the tab's `getControlValue` / `setControlValue` overrides, so storage keeps real arrays while the UI shows text.
- Run `npm run smoke-test` - `bundle.ts`, `trust.ts`, and `edits.ts` must pass their fixture checks (no Obsidian install needed for this one; it runs under plain Node against `scripts/fixtures/curation-bundle/`).
- **`npm run smoke-test` only covers the three pure modules.** Anything that needs the Obsidian `App` - a vault scan via `metadataCache`, the review session's writes through `processFrontMatter`/`vault.modify`, the mtime guard on "corrected", split-leaf source opening - has no automated test (there's no headless Obsidian to run one in) and must be checked by hand in a real vault first.
- **Do not commit `main.js`.** It is generated and git-ignored; the release workflow builds it and attaches it to the GitHub release.
- Keep changes focused; describe what and why in the PR.
- Follow the existing style: build DOM with `createEl`/`createDiv` (never `innerHTML`), put styling in `styles.css`, and register events via `registerEvent` so they unload.
- **Keep `bundle.ts`, `trust.ts`, and `edits.ts` free of runtime dependencies.** They take already-parsed frontmatter (plus, for `trust.ts`, a fixed `today`) and pull in nothing that isn't deterministic static data - not Obsidian, not a YAML library, not `Date.now()`; `bundle.ts`'s one import is the static schema manifest (`src/lokf-vocab.json`), which keeps the concept-type vocabulary in step with the pinned schema. That is what lets the whole rule set run under plain Node in the smoke test with every date-dependent label reproducible. Parsing and the current date belong in `main.ts`, which uses Obsidian's own `metadataCache`.
- **Refreshing the vocabulary manifest.** `src/lokf-vocab.json` (the field descriptions behind *Look up a LOKF field*) is generated from a pinned LOKF schema by `node scripts/build-vocab.mjs` - a maintenance step, not part of `npm run build`. Re-run it, and commit the result, only when bumping the pinned schema. It prefers `lokf vocab --all --json` (install the [`lokf`](https://pypi.org/project/lokf/) toolkit so it is on `PATH`) and falls back to reading `../lokf/lokf.yaml` from a sibling checkout; `src/fields.ts` takes each field's wording straight from the manifest. Kept identical to LOKF Registrar so the two plugins' field reference never drifts.
- **Never let a write exceed what `references/review-session.md` in the `lokf-curator` skill specifies for that verb.** These guardrails are the product: one verb, one concept, one person's answer; no proposed corrections; no touching a field the verb's table doesn't name.

## Code of conduct

Participation here is covered by the [Contributor Covenant](CODE_OF_CONDUCT.md), the same one `lokf-agent-skills` and LOKF Registrar use.

## Using AI tools

AI assistance is welcome here - this repository's own `.lokf/` bundle is maintained by an agent, and the plugin exists to record a person's verdict on that agent-written knowledge. What that requires of you is unchanged: you are the author of whatever you submit, you are responsible for understanding and defending it in review, and an agent may not participate in discussion on your behalf. The full rules, including how this repo's own scheduled `knowledge-librarian` agent is held to them, are in [AI_COVENANT.md](AI_COVENANT.md).

## Reporting bugs

Open an issue with your Obsidian version, OS, plugin version, and steps to reproduce.

## Releasing (maintainers)

Releases go through a PR like any other change, so the version bump is reviewable and the tag lands on `main`:

```bash
git switch -c release/0.2.0 origin/main
npm version minor --no-git-tag-version   # updates package.json + manifest.json + versions.json
```

`.npmrc` sets `tag-version-prefix=""`, so a tag created by `npm version` is a bare `0.2.0` with no leading `v` - which is what Obsidian requires.

Then date the `## [Unreleased]` heading in `CHANGELOG.md`, open the PR, and once it's merged, tag the merge commit:

```bash
git switch main && git pull
git tag 0.2.0 && git push origin 0.2.0
```

Pushing the tag triggers the release workflow, which builds, attests provenance, and opens the release as a **draft** carrying `main.js`, `manifest.json`, and `styles.css`. Review the draft and publish it by hand - that is also when the release notes get written.
