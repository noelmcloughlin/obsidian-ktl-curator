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

The version number is no longer hand-picked. Write `## [Unreleased]` in `CHANGELOG.md` as you go - the same section you already keep current for each change - and describe what changed with a [Conventional Commits](https://www.conventionalcommits.org/) type (`feat:`, `fix:`, `security:` for a patch, `BREAKING CHANGE:` in a footer, or `!` after the type, for a major). Open the PR as normal.

**Only `feat:`, `fix:`, `security:` and a breaking-change marker cut a release.** `docs:`, `chore:`, `refactor:`, `style:` and `test:` deliberately do not: a branch carrying only those merges cleanly, releases nothing, and leaves its `## [Unreleased]` entries to ship with the next release that does. So type the commit for what the change *is* - a user-visible behaviour change is a `feat:` even when most of the diff is prose. If a PR should release and its commits are typed too quietly, squash-merge it and give the squash commit the right type.

Once it merges to `main`, [`semantic-release.yml`](.github/workflows/semantic-release.yml) does the rest:

1. Computes the next version from the commits since the last release. Nothing lands if none of them warrant one.
2. Refuses to proceed if `## [Unreleased]` is empty (`.github/scripts/changelog-release.mjs check`) - this pipeline releases only what's already been written up, never a bare version bump.
3. Retitles that section to `## [X.Y.Z] - YYYY-MM-DD` and inserts a fresh empty `## [Unreleased]` above it, and bumps `package.json` (which triggers the existing `version` script - `manifest.json` and `versions.json` update exactly as they did under `npm version`, `.npmrc`'s `tag-version-prefix=""` included).
4. Commits those files and creates the bare `X.Y.Z` tag Obsidian requires.

5. Calls [`release.yml`](.github/workflows/release.yml) as a reusable workflow (`build-and-attest`), which builds, attests provenance, and opens the release as a **draft** carrying `main.js`, `manifest.json` and `styles.css`. Review the draft and publish it by hand. It is called rather than tag-triggered because a tag pushed with the default `GITHUB_TOKEN` does not re-trigger workflows; a hand-pushed tag still fires `release.yml`'s own `push: tags:` trigger and takes the same path.

Step 3 onward runs behind the `release` GitHub Environment - **configure required reviewers on it once, in this repository's Settings → Environments**, or every qualifying merge ships unattended. `semantic-release.yml`'s own header comment has the full design and why each piece is shaped the way it is.

A hand-pushed tag (`git tag 0.2.0 && git push origin 0.2.0`) still works exactly as before, going through the same `release.yml` - useful for a hotfix or recovering from an automation problem, not the normal path.

### What the repository settings mean for you

Two are worth knowing because they explain what a pull request waits on, or refuses:

- **Changes reach `main` by pull request, but the rule is not enforced by a ruleset.** A ruleset that requires pull requests rejects every direct push, and the release job's own push - the changelog promotion and tag in step 4 - cannot be exempted from it: a ruleset bypass list accepts roles, teams, GitHub Apps and Dependabot, and `github-actions[bot]` is none of those. So the pull-request discipline here is a convention, held to by the maintainer, not a gate. Open one anyway.
- **"Require signed commits" as a branch rule is deliberately off**, and must stay off. A `git commit` made inside a runner is unsigned - GitHub only auto-signs commits made through the web UI or API, and `@semantic-release/git` uses the git CLI. Turning the rule on would reject step 4 above and break every release. Signing your own commits locally is a different thing, nothing gates on it here, and it is still worth doing - see below.

### Signing your commits (encouraged, not required)

A signature ties a commit to you cryptographically, so GitHub shows it `Verified`. Nothing in this repository requires one; it is one setup and free afterwards.

**Choose one format - GPG or SSH.** They are not interchangeable: git reads `user.signingkey` in whichever format `gpg.format` names, so a file in the wrong format fails with `could not load public key`. Either way, `git config user.email` must be a **verified email** on your GitHub account, or commits stay `Unverified`.

**GPG.** The key lives in `~/.gnupg/`; exporting prints it for pasting rather than writing a file you keep. Choose `ECC (sign only)`, `Curve 25519`, and an expiry of 1-2 years rather than never. Record the passphrase in your password manager as you type it - there is no recovery.

```bash
gpg --full-generate-key
gpg --list-secret-keys --keyid-format=long   # fingerprint is under `sec`
git config --global gpg.format openpgp
git config --global user.signingkey <fingerprint>
git config --global commit.gpgsign true
gpg --armor --export <fingerprint>           # paste at github.com/settings/keys -> New GPG key
```

**SSH**, reusing a key you may already have. The file must be a real SSH public key (`ssh-ed25519 AAAA...`), not a GPG export saved under an SSH-looking name:

```bash
ssh-keygen -t ed25519 -C "you@example.com"   # skip if ~/.ssh/id_ed25519 exists
git config --global gpg.format ssh
git config --global user.signingkey ~/.ssh/id_ed25519.pub
git config --global commit.gpgsign true
cat ~/.ssh/id_ed25519.pub                    # paste under SSH keys -> Key type: Signing Key
```

GitHub keeps authentication and signing keys in separate lists; a key registered only for auth leaves every commit `Unverified`, even though it is the same key. Check your work with `git log --show-signature -1`.

**Renew a GPG key before it expires.** Set a calendar reminder a month ahead of the date `gpg --list-secret-keys` shows. Extending keeps the same fingerprint, so past commits keep verifying:

```bash
gpg --quick-set-expire <fingerprint> 2y
gpg --armor --export <fingerprint>
```

Then delete the old entry on github.com/settings/keys and add the exported key again - GitHub stores the expiry from the copy you uploaded and does not re-read it. An expiry is not a compromise: commits signed while the key was valid stay `Verified`, and only *new* signatures stop. If a key is ever actually stolen, revoke it rather than extending it.

If signing fails with no prompt at all, GPG has nowhere to ask for your passphrase - add `export GPG_TTY=$(tty)` to your shell profile and open a new shell. [`lokf-agent-skills`](https://github.com/noelmcloughlin/lokf-agent-skills/blob/main/CONTRIBUTING.md#signing-your-commits) has the longer walkthrough.

