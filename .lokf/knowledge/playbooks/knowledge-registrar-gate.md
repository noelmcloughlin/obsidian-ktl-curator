---
type: Playbook
id: https://lokf-curator.example/knowledge/playbooks/knowledge-registrar-gate
title: Knowledge registrar gate
description: "The knowledge-registrar.yaml workflow - validates the bundle on every pull request that touches it, and ties every newly added human: confirmation (the event this plugin's Confirm verb writes) to evidence GitHub holds - that person's approval of the pull request, or their verified signature on the commit that introduced it - with an environment-reviewer attestation as the escape hatch for a repository that cannot sign."
genre: how-to
resource: .github/workflows/knowledge-registrar.yaml
sources:
  - resource: .github/workflows/knowledge-registrar.yaml
  - resource: SECURITY.md
relatedTo:
  - https://lokf-curator.example/knowledge/services/edits-engine
  - https://lokf-curator.example/knowledge/references/review-session
dependsOn:
  - https://lokf-curator.example/knowledge/references/lokf-toolkit
generated:
  by: process:lokf-librarian
  at: "2026-09-13T23:00:00Z"
status: draft
verified:
  - by: process:lokf-librarian
    at: "2026-09-13T23:00:00Z"
---

# Overview

`.github/workflows/knowledge-registrar.yaml` is the registrar's job in CI -
keeping records well-formed and their provenance paperwork straight, never
judging whether a claim is true. It is a copy of the `lokf-sidecar` template
in `lokf-agent-skills`; the copy here adds only `persist-credentials: false`
on its checkout, a top-level `permissions: {}`, and its own wording of two
comments, the harden-runner note and the `provenance` job's signing setup
(`SECURITY.md`, "The attribution gate is installed"); the design with its
stated limits is documented once, in that repository's `SECURITY.md`. It runs on a pull
request that touches `.lokf/**`, `knowledge_bundle/**` or the workflow
itself, on a Monday 06:00 UTC schedule, and on demand. Three jobs:

**`validate` - "Validate the LOKF bundle".** `uv sync` in `.lokf/`, then
`uv run lokf validate knowledge` - the same check `just lokf-validate` runs
locally.

**`provenance` - "Check new human confirmations".** Pull requests only;
`contents: read`, `pull-requests: read`. A `verified` event whose actor is
`human:<id>` - exactly what **Confirm** and **Wrong - I corrected it**
append (`edits-engine.md`) - claims that a named person checked a concept
against its source, and nothing in the bundle's format proves it: `lokf
validate` accepts a well-formed event from any writer. So this job reads the
diff of `.lokf/knowledge` and `knowledge_bundle` between the merge base and
the head, collects every newly added `by: human:<id>` (anchored on `by:`,
so the `human:` a send-back note leaves under `## Open questions` is not
mistaken for an event), and for each actor asks GitHub for evidence: an
APPROVED review of the pull request from that login, or, failing that, a
commit in the pull request that introduces the event and that GitHub
reports as signature-verified *and* authored by that same login. Signature
status comes from GitHub's API rather than `git log`, because a runner holds
no keys - which is also what ties a signature to an account rather than
merely proving one exists. An actor with neither is *unbacked*: the job
writes a summary naming them and fails, unless the
`KNOWLEDGE_CURATION_ENVIRONMENT` repository variable is set, in which case
it passes the verdict on to `attestation`. A pull request that adds no
`human:` event passes without any of this.

**`attestation` - "Attest to an unbacked confirmation".** Runs only after an
*unbacked* verdict, inside the GitHub Environment named by that variable, so
the run pauses until one of the environment's required reviewers clicks
Approve - a fresh, logged human action per pull request, not a switch that
turns the check off. Unlike a review approval, an environment reviewer may
be the person who opened the pull request, which is what makes this work
for a solo maintainer who cannot sign. Both halves are needed: an
environment with no required reviewers approves itself instantly, so
setting the variable without configuring reviewers silently disables the
gate. What gets recorded is that someone with repository access vouched out
of band - not that anyone opened the source.

# What follows for the curator

The curator id this plugin asks for (`human:<id>`, a short lowercase name,
never an email) has to be the GitHub login of the person who will approve
the pull request or sign its commits, or the gate cannot match the two.
GitHub will not let anyone approve their own pull request, so on a
one-person repository signing is the path: a GPG key, or the SSH key already
used to push, registered on GitHub as a *signing* key (a separate list from
authentication keys), `commit.gpgsign true`, and a commit email verified on
the account. The skills' `lokf-sidecar/references/automation.md` has both
setups and the trap between them. Without that, every confirmation this
plugin records is rejected at this gate - the intended failure: an
unchecked concept is supposed to read as unchecked.

# What it does not do

It never runs on the librarian's own review pull request, which
`knowledge-librarian.yaml`'s `publish` job opens with the default
`GITHUB_TOKEN` - GitHub does not start `pull_request` workflows for such a
PR - so `publish` carries its own two checks first (a path allow-list, and
no added `by: human:` claim; `SECURITY.md` links to the skills repository
for that design). And it is not a required status check: `main`
deliberately has no merge gate (`CONTRIBUTING.md`), because a path-filtered
required check sits at "Expected" for ever on pull requests that never
trigger it, and a release bot's push cannot be exempted from a ruleset.
Access control, plus reading the checks before merging, is what gates a
change.
