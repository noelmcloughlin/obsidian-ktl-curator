# Security Policy

*This file is a policy, not a threat model. It says how to report, what the plugin promises, and what holds each surface in this repository, a line or two each that links to where the reasoning lives - a workflow header, the skills repository's [threat model](https://github.com/noelmcloughlin/knowledge-trust-ladder/blob/main/docs/threat-model.md) - and `npm run check` holds it to a word budget so it stays that way.*

## Reporting a vulnerability

Use GitHub's [private vulnerability reporting](https://github.com/noelmcloughlin/obsidian-ktl-curator/security/advisories/new), not a public issue or a pull request. Say which file is affected - plugin source, or a workflow under `.github/workflows/` - how it is exploitable, and the smallest reproduction you have. One person maintains this repository: expect a first reply in days, not hours, and no bounty.

## Supported versions

Only the latest release line receives fixes. A security fix ships as a patch release and is noted in [CHANGELOG.md](CHANGELOG.md); older tags are not maintained.

## The plugin

KTL Curator runs inside Obsidian, on the vault you open it in, and nowhere else.

- **No network, no telemetry, no remote code.** It makes no outward call and loads nothing while it runs.
- **Writes only what you ask for.** It reads the vault to compute trust labels, and writes only through the five review verbs and two file-creating commands, each on a button press; [Privacy](README.md#privacy) lists them.
- **Vault content is data, never instructions.** There is no AI model, and nothing in a note is executed - not as a command, a script, a template or a URL. Frontmatter, headings and source paths are inspected by deterministic rules.
- **It never verifies a claim itself.** It puts a concept's recorded source beside its claim and asks a person; a source you open is shown to you, never fetched, parsed or interpreted by the plugin.
- **No dependency on another plugin.** It detects nothing and calls into nothing else installed in the vault.

The realistic risk is a trust-label rule giving a wrong label, or a verb writing a malformed frontmatter edit or `log.md` line; every write goes through Obsidian's own atomic `processFrontMatter` and `vault.modify`, and none can leak data or reach outside the vault. A source you open still deserves the scrutiny you would give any file; that is a property of the content, not of the plugin.

## This repository's automation

Every workflow pins its actions to commit SHAs, declares `permissions: {}` at the top and runs harden-runner in audit mode. Dependabot bumps the pins and the npm devDependencies, none of which ships in `main.js`.

| Surface | What holds it |
| --- | --- |
| `build.yml`, `lint-and-docs.yaml` | Read-only: build, lint and smoke test; ShellCheck, `actionlint`, markdownlint, link check and codespell. |
| `knowledge-registrar.yaml` | Read-only, the template's jobs unchanged. Its `provenance` job accepts a newly added `human:` confirmation only with an approving review or a verified signature on the commit. [Human attribution](https://github.com/noelmcloughlin/knowledge-trust-ladder/blob/main/docs/threat-model.md#human-attribution-human-is-a-claim-not-a-credential). |
| `knowledge-release.yaml` | The template's jobs, inert until dispatched or armed by `KNOWLEDGE_RELEASE_ENABLED`. Only `attach`, which runs no third-party packages, can write. |
| `semantic-release.yml`, `release.yml` | The one path that writes to `main`, behind the `release` Environment. The tag must match `manifest.json`, the release is a **draft** for a person to publish, and build provenance is attested. [How the LOKF repositories release](https://github.com/noelmcloughlin/knowledge-trust-ladder/blob/main/docs/releasing.md). |
| `knowledge-librarian.yaml` and `.lokf/scripts/knowledge-librarian.sh` | The `ktl-sidecar` template's jobs and checks, unchanged; the copy differs from the template only in its comments and in the pin it names. The agent runs with no write token and no credential on disk; only `publish`, which runs no agent code, can write, and it confines the patch to `.lokf/knowledge/`, `knowledge_bundle/` and `.lokf/feedback.md` and refuses a `human:` claim. Armed only while `KNOWLEDGE_LIBRARIAN_ENABLED` is `true`; `AGENT_CLI` picks the agent, never the command, and its credential, a secret or the job token, reaches only the agent; `schedule` and `workflow_dispatch` only. [Prompt-injection guards](https://github.com/noelmcloughlin/knowledge-trust-ladder/blob/main/docs/threat-model.md#prompt-injection-guards). |
| `README.md`, `llms.txt`, `src/`, `.lokf/knowledge/`, `.lokf/feedback.md` | What the librarian reads. `feedback.md` is the one input a stranger can write; the skill treats it as content to inspect, never instructions to follow. |

If every inherited guard failed, the worst case is a pull request confined to the bundle, which only the maintainer can merge, after reading it. Nothing on that path reaches `src/`, a release artifact or a published release.

`main` blocks deletion and force-pushes and requires linear history, deliberately nothing more; secret scanning and push protection are on; CodeQL is off because nothing here has a network surface or a runtime dependency. The reasons are under [Repository hardening](https://github.com/noelmcloughlin/knowledge-trust-ladder/blob/main/docs/threat-model.md#repository-hardening).

## Not covered

- The sidecar templates' design, which is `knowledge-trust-ladder`'s. `knowledge-registrar.yaml`, `knowledge-release.yaml` and the scripts under `.lokf/scripts/` are copies of its `skills/ktl-sidecar/templates/` and move only when copied again from there: from the release `TRUST_LADDER_SKILLS_REF` names, or from its `main` when a fix should not wait for the next tag; the pin then follows at that release. The pin itself changes only the skill the scheduled run installs, and `knowledge-librarian.yaml` carries local changes, so it is compared by hand. To confirm a copy, `diff` it against the templates at the copied ref; `knowledge-preflight.sh` also reports drift on its `copies` line where a sidecar is installed to compare against.
- A compromised runner, upstream action or agent harness: this is a baseline, not a sandbox. Report a finding in one anyway, with scope and reproduction.
- Whether a bundle is *true*. [AI_COVENANT.md](AI_COVENANT.md) sets the human-accountability rules this automation runs under.
