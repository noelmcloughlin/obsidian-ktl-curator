## Summary

## What changed?

- [ ] Plugin source (`src/`) - trust computation, the review session, the curator view, or settings
- [ ] This repo's own `.lokf/knowledge/` bundle (documentation *about this repo*)
- [ ] Repository packaging only (CI, docs, templates unrelated to plugin behavior)

## Checklist

- [ ] `npm run check` passes locally (build, lint, smoke test - the same steps `build.yml` runs)
- [ ] Anything needing a real Obsidian `App` (a vault scan, bundle-root resolution, a review verb writing frontmatter or `log.md`, the modals) was checked by hand in a real vault - there is no headless Obsidian to test it in
- [ ] `CHANGELOG.md` has a line or two under `[Unreleased]` if this changes plugin behavior
- [ ] If `.lokf/` changed, `cd .lokf && just lokf-validate` passes

## AI Assistance

If you used AI tools while preparing this PR, you are still the author and responsible for understanding, verifying, and defending your submission. Please engage with reviewers personally rather than through your agent during feedback and revisions. Don't dump LLM output into this PR without curation. See the [AI Covenant](../AI_COVENANT.md) for details.
