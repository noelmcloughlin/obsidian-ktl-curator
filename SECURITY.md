# Security Policy

## The plugin

LOKF Curator runs entirely inside Obsidian, locally, on the vault you open it in:

- **No network access, no telemetry, no remote code.** The plugin never makes an outward network call and loads no code or workflow while computing a trust report or running a review session.
- **Writes only what you explicitly ask for.** It reads Markdown/YAML in the open vault to compute trust labels, and writes to the vault only through the five review verbs (Confirm / Wrong - send back / Wrong - I corrected it / Retire / Later) and the two Step-3 commands (Create curation policy, Record something missing) - each fired by a button press, never automatically.
- **Vault content is data, never instructions.** The plugin has no AI model and executes nothing from a note - not as a command, a script, a template, or a URL. A concept's frontmatter, headings, and source path are inspected by deterministic rules; a source's text, when opened, is displayed for a person to read, never interpreted by the plugin. There is nothing in the plugin's own code path for a crafted note to inject into.
- **The plugin never verifies a claim itself.** It puts a concept's recorded source next to its claim and asks a person; it never fetches, parses, or reasons about the source's content, whether that source is inside the vault or not.
- **No dependency on another plugin.** It detects nothing and calls into nothing else installed in the vault (see the README's "Where this fits").

Because of this, the plugin's realistic risk surface is ordinary: a bug in a trust-label rule producing a wrong label, or - the five places it writes - a verb writing a malformed frontmatter edit or a malformed `log.md` line. Every write goes through Obsidian's own `processFrontMatter`/`vault.modify` APIs, which are atomic read-modify-writes; none can leak data or reach outside the vault.

Any source content a person opens through the review card's "Open source" button still deserves the same scrutiny you'd give any file before trusting it - that's a property of the content, not of this plugin.

## Reporting a vulnerability

Please use GitHub's private vulnerability reporting at:

<https://github.com/noelmcloughlin/obsidian-lokf-curator/security/advisories/new>

rather than a public issue. Include:

- the affected file (plugin source, or a workflow under `.github/workflows/`);
- how it is exploitable;
- any proof of concept or minimally sufficient reproduction details.

## Supported versions

Only the latest published release line receives security fixes.

- Security fixes are issued as patch releases when needed.
- Older release tags are not maintained.
- If a published release is found to be vulnerable, the fix lands in the latest release branch and is noted in the repository changelog.

---

## This repository's own automation

Everything below concerns how **this GitHub repository** builds, releases, and maintains its own documentation - not the Obsidian side. It's relevant if you're auditing this repo's CI or contributing to its `.lokf/knowledge/` bundle; skip it if you're only asking whether the plugin itself is safe to run (see above).

### Scope

The repository's non-Markdown, non-TypeScript execution surfaces are:

- the release workflow in `.github/workflows/release.yml`, which builds and publishes the plugin's release artifacts;
- the build workflow in `.github/workflows/build.yml`, which runs on every push and PR;
- the lint-and-docs workflow in `.github/workflows/lint-and-docs.yaml` (ShellCheck, `actionlint`, markdownlint, link-checking, codespell) and the registrar workflow in `.github/workflows/knowledge-registrar.yaml`, which validates the knowledge bundle's *form* on every `.lokf/**` PR - both read-only;
- the semantic-release workflow in `.github/workflows/semantic-release.yml`, which computes the next version from commits, promotes `CHANGELOG.md`, and bumps `manifest.json`/`package.json`/`versions.json` on push to `main`, behind the `release` GitHub Environment - `release.yml` above still does the actual build/attest/publish, triggered by the tag this workflow creates;
- the scheduled GitHub Action in `.github/workflows/knowledge-librarian.yaml`, which installs a pinned [`lokf-agent-skills`](https://github.com/noelmcloughlin/lokf-agent-skills) skill and runs it against this repo's own `.lokf/knowledge/` bundle (documentation *about this repository*, not plugin code), then opens a review PR. The agent itself runs with **no write permissions** - see "Repository hardening" below. This is unrelated to anything the plugin does at runtime.
- the wrapper script `.lokf/scripts/knowledge-librarian.sh`, which that workflow executes;
- this repository's own `README.md`, `llms.txt`, and the `.lokf/knowledge/` content that workflow reads and writes: these are prompt-injection surfaces whenever an agent is asked to act on repository text, external URLs, or reader feedback.

### Repository hardening

- GitHub Actions are pinned to reviewed commit SHAs instead of floating tags, in every workflow. `.github/dependabot.yml` keeps those pins current (weekly), alongside the plugin's npm devDependencies and the `.lokf/` sidecar's Python toolchain.
- Every workflow declares `permissions: {}` at the top level, so each job opts into only the scopes it needs and nothing inherits a broader default.
- All workflows run Step Security's hardened-runner in audit mode to monitor runner egress.
- **The librarian workflow runs in two jobs so the agent and the write token never meet.** `refresh` runs the agent - third-party code - with `contents: read` and `persist-credentials: false`, so no git credential is on disk while it executes, and hands its proposed change to `publish` as a patch artifact. Only `publish`, which runs no agent code, holds `contents: write` / `pull-requests: write`. What each of those jobs checks, and why, is the template's design - see the next section.
- **`main` is protected, but not by a merge gate.** Deletions and force-pushes are blocked and linear history is required. A rule requiring pull requests, or requiring status checks to pass, is deliberately **not** enabled: rulesets apply both to direct pushes as well as to merges, and the release workflow's own commit to `main` cannot be exempted from them - a bypass list accepts roles, teams, GitHub Apps and Dependabot, and `github-actions[bot]` is none of those. What gates a change here is access control, not a rule: only the maintainer can write to this repository, CI runs on every pull request, and its result is read before merging. Secret scanning and push protection are enabled. These are GitHub repository *settings* rather than files in the tree - nothing in CI can assert they are still in force, so keeping them enabled is a maintainer responsibility.
- The `release.yml` job verifies the pushed tag matches `manifest.json` before building, publishes the release as a **draft** for manual review, and attaches build-provenance attestation.
- `semantic-release.yml`'s `release` job, which pushes a commit/tag to `main`, sits behind the same `release` GitHub Environment `publish.yml`-style workflows use elsewhere in this project (configure required reviewers on it in this repository's own Settings > Environments); its `npm install` of the pinned release tooling runs with `--ignore-scripts`.
- CodeQL is intentionally **not** enabled: the plugin is a small TypeScript bundle with no server-side surface, no network calls, and no untrusted input beyond vault Markdown it parses with deterministic rules. Dependency review is covered by Dependabot above, since every npm dependency here is a devDependency that never ships in `main.js`. If either assumption changes - a runtime dependency, or a network feature - add them then rather than carrying unused overhead now.

### The librarian workflow: what is inherited, what this repository owns

`.github/workflows/knowledge-librarian.yaml` and `.lokf/scripts/knowledge-librarian.sh` are copies of the `lokf-sidecar` template in [`lokf-agent-skills`](https://github.com/noelmcloughlin/lokf-agent-skills), and their security design is that repository's, documented once there:

- how the two-job split keeps the agent away from any write-scoped token, and why the `publish` job's own checks - path confinement derived from the patch itself, refusal of any added `by: human:` claim - are the backstop rather than the wrapper's: [Prompt-injection guards](https://github.com/noelmcloughlin/lokf-agent-skills/blob/main/SECURITY.md#prompt-injection-guards);
- how the `lokf-librarian` skill treats `.lokf/feedback.md`, and everything else it did not author, as content to inspect and never as instructions to follow: the same section;
- why a skill's stated scope is prose, not a permission, when you run it interactively: [Interactive use: scope is advisory, not enforced](https://github.com/noelmcloughlin/lokf-agent-skills/blob/main/SECURITY.md#interactive-use-scope-is-advisory-not-enforced);
- why the review PR it opens does not trigger this repository's `pull_request` checks, and what stands in for them: [Repository hardening](https://github.com/noelmcloughlin/lokf-agent-skills/blob/main/SECURITY.md#repository-hardening).

Restating that design here would imply this repository controls it. It does not: a change there reaches here on the next `LOKF_SKILLS_REF` bump, and a copy here would go stale with nothing in CI to notice. What this repository does own, and is accountable for:

- **The deployed copy.** Both files carry every job and check the template does; the only edits are `persist-credentials: false` on the read-only checkout steps (stricter than the template, not looser). Anything further that is edited locally becomes this repository's responsibility rather than the template's; `diff` against `skills/lokf-sidecar/templates/` in a checkout of `lokf-agent-skills` to confirm.
- **The switches.** The agent step runs only while the `KNOWLEDGE_LIBRARIAN_ENABLED` repository variable is `true`; `AGENT_CLI` chooses *which* non-interactive agent runs, never *what command*; the workflow triggers only on `schedule` and `workflow_dispatch`. All three are readable in this repository's own YAML.
- **The surfaces.** What the librarian reads *here* is `README.md`, `llms.txt`, `src/` and the `.lokf/knowledge/` bundle - and `.lokf/feedback.md`, the one input that can originate from someone with no repository access.
- **The consequence if the inherited guards fail.** The agent holds no write-scoped token, so the worst outcome is a proposed patch confined to `.lokf/knowledge/` and `.lokf/feedback.md`, applied by a job that runs no agent code, arriving as a pull request that only the maintainer can merge, after reading it. Nothing on that path reaches the plugin's own source, its release artifacts, or a published release.
- **The attribution gate is installed.** `.github/workflows/knowledge-registrar.yaml` here carries the template's `validate`, `provenance` and `attestation` jobs, unchanged, so a newly added `human:` confirmation must be backed by evidence GitHub holds - an approving review, or a verified signature on the introducing commit. [Human attribution](https://github.com/noelmcloughlin/lokf-agent-skills/blob/main/SECURITY.md#human-attribution-human-is-a-claim-not-a-credential) has the design and its stated limits.

See also [AI_COVENANT.md](AI_COVENANT.md), which sets the human-accountability rules this automation operates under.

## What this does not cover

This policy does not turn the repository into a formal sandbox. It does not guarantee that a compromised agent, upstream dependency, or compromised runner will be impossible to abuse. It is a practical baseline intended to reduce the most likely failures in this repository's own build, release, and AI-assisted documentation workflow - a set of concerns that does not extend to the plugin most readers of this file actually came here about.

If a vulnerability is found in an external dependency, a copied workflow template, or an AI agent harness behavior, it should still be reported here with clear scope and reproduction details.
