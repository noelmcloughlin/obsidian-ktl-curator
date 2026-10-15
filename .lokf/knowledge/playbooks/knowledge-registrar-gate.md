---
type: Playbook
id: https://ktl-curator.example/knowledge/playbooks/knowledge-registrar-gate
title: Knowledge registrar gate
description: "The knowledge-registrar.yaml workflow: validates the bundle and its relation targets on every pull request that touches it, and ties every human: confirmation a pull request adds, changes or removes to that person's approval of the pull request or their verified signature on the commit, with an environment reviewer's attestation as the fallback."
genre: how-to
resource: .github/workflows/knowledge-registrar.yaml
sources:
- resource: .github/workflows/knowledge-registrar.yaml
- resource: .lokf/scripts/knowledge-conventions.sh
- resource: .lokf/scripts/knowledge-provenance.sh
- resource: .lokf/justfile
- resource: SECURITY.md
relatedTo:
- https://ktl-curator.example/knowledge/services/edits-engine
- https://ktl-curator.example/knowledge/references/review-session
dependsOn:
- https://ktl-curator.example/knowledge/references/lokf-toolkit
generated:
  by: process:ktl-librarian
  at: "2026-10-15T23:47:44Z"
status: draft
verified:
- by: process:ktl-librarian
  at: "2026-10-15T23:47:44Z"
---

# Overview

`.github/workflows/knowledge-registrar.yaml` is the registrar's job in CI. It keeps the knowledge bundle's records well-formed and provenanced, and never judges whether their content is true; that is the curator's job. It is a copy of the `ktl-sidecar` template in `knowledge-trust-ladder`, and `SECURITY.md` says the copy keeps the template's jobs unchanged. The skills repository's `docs/three-lines.md` places this workflow as the second line of defence and says what remains open.

The workflow runs on a pull request that touches `.lokf/**`, `knowledge_bundle/**` or the workflow itself, on a Monday 06:00 UTC schedule, and on demand. A top-level `permissions: {}` gives no token scope unless a job opts in. None of its three jobs can write to the repository: each runs with a read-only token, keeps no credential on disk, and runs no LLM or agent.

## validate: "Validate the LOKF bundle"

This job runs on every trigger. It checks out the full history with `persist-credentials: false`, and installs the toolkit with `uv sync --locked`, so it runs the toolkit `.lokf/uv.lock` names, each file checked against its recorded hash. It then runs the justfile's `lokf-check-refs` recipe through `uvx --from rust-just==1.47.0 just`. That recipe runs `lokf validate --check-refs`: schema validation, plus a check that every typed-relation target in the bundle's own namespace resolves to a concept. A host with a domain schema names it as `schema :=` in `.lokf/justfile` and the recipe passes it, so no host edits the workflow. This repository's `schema` is empty.

The last step runs `bash scripts/knowledge-conventions.sh knowledge`, which checks what `lokf validate` cannot see: one ISO-date heading per day in `log.md`, quoted timestamps, `verified` as a list with one librarian event, and open questions in the shape the curator reads. On a pull request the step passes the merge base as `--since`, so rule 14 reads each of the pull request's commits: a commit that records a person's confirmation changes only the verdict. A scheduled run has no base and skips rule 14.

## provenance: "Check new human confirmations"

This job runs on pull requests only, with `contents: read` and `pull-requests: read`. A `human:<id>` event claims that a named person checked a concept against its source, and `lokf validate` accepts a well-formed event from any writer. **Confirm** and **Wrong - I corrected it** write such events (`services/edits-engine.md`).

The job reads each event whole, a `verified` entry or a `generated` record, keyed by the concept's `id`, at the merge base and at the head. An event present at the head and absent at the base names an actor who must stand behind it. So does a removed `verified` event, whether it is struck out or its concept deleted. For each actor, the job asks GitHub for evidence:

- an APPROVED review of the pull request from that login, or
- for each commit that adds, changes or removes the event, GitHub's report that the commit is signature-verified and attributed to that same login.

The job takes signature status from GitHub's API rather than `git log`, because a runner holds no keys, and GitHub's check ties a signature to an account. An actor with neither, or an id that is not a login the gate can check, is unbacked. The job then writes a summary naming them and fails, unless the `KNOWLEDGE_CURATION_ENVIRONMENT` repository variable is set, in which case it passes the verdict to `attestation`. A pull request that adds, changes or removes no `human:` event passes.

Where the repository carries curator keys in `.lokf/curators/`, a second step runs `.lokf/scripts/knowledge-provenance.sh`, which verifies the same signatures with plain git against the keys on file. A signature from a key not on file for that id then fails even when GitHub shows it as Verified. This repository carries `.lokf/curators/noelmcloughlin.asc`.

## attestation: "Attest to an unbacked confirmation"

This job runs only after an unbacked verdict, inside the GitHub Environment the variable names, so the run pauses until one of that environment's required reviewers clicks Approve. The deployment log records the click. Unlike a review approval, an environment reviewer may be the person who opened the pull request, which makes this work for a person who opens the pull request and cannot sign. An environment with no required reviewers approves itself instantly, so setting the variable without configuring reviewers silently disables the gate. The job records that someone with access to the repository vouched out of band, not that anyone checked the concepts.

# What follows for the curator

The curator id this plugin asks for (`human:<id>`) has to be the GitHub login of the person who approves the pull request or signs its commits, or the gate cannot match the two. GitHub will not let anyone approve their own pull request, so when the confirming person also opens it, signing is the path. The workflow's comments give the one-time setup with the SSH key already used to push: set `gpg.format ssh`, `user.signingkey` and `commit.gpgsign true`, then add that same key at `github.com/settings/keys` as a signing key. GitHub keeps authentication and signing keys in separate lists, and a key registered only for authentication leaves every commit Unverified. The commit email must also be a verified email on the account. If nobody actually checked a concept, the workflow says to remove the event: an unchecked concept is supposed to read as unchecked.

# What it does not do

The workflow never runs on the librarian's own review pull request. `knowledge-librarian.yaml`'s `publish` job opens that pull request with the default `GITHUB_TOKEN`, and GitHub does not start `pull_request` workflows for a pull request that token opened. So `publish` carries its own checks: it confines the patch to `.lokf/knowledge/`, `knowledge_bundle/`, `.lokf/feedback.md` and `.lokf/questions.md`, and refuses a change to a person's record (`SECURITY.md`). The gate is no merge requirement either: `SECURITY.md` says `main` blocks deletion and force-pushes and requires linear history, deliberately nothing more.
