# For the curious: what gets computed, and what it rests on

[The README](../README.md) says everything you need to use LOKF Curator. What follows is the reasoning behind it.

## The trust labels, and the fields they come from

Every label is arithmetic over frontmatter, computed fresh on each refresh and never stored:

| Label | Rule |
|---|---|
| Confirmed by a person | any `verified[].by` starts with `human:` |
| Checked by automation only | `verified` present, no `human:` actor |
| Nobody has checked this yet | no `verified` key at all |
| Still a draft | `status: draft` |
| Retired | `status: deprecated` - counted once, then excluded from every other label and the queue |
| Edited since a person last confirmed it | `generated.at` later than the newest `human:` `verified[].at` |
| Past its review date / due soon | `stale_after` against today |
| *N* other concepts rely on this | concepts whose typed relations target this concept's `id`, across every configured bundle |
| Doesn't fit the built-in vocabulary | `type` outside the LOKF vocabulary classes |

The rules, with every parsing edge case (a bare `verified` mapping, an exact `## Open questions` heading versus a passing mention of one in prose, cross-bundle relation targets), are `references/trust-fields.md` in the `lokf-curator` skill. This plugin implements that document; it does not relax or restate it.

## What this plugin leaves to others

It does not validate schema - that is [LOKF Registrar](https://github.com/noelmcloughlin/obsidian-lokf-registrar), at the tier below - which its trust picture quietly assumes: a concept's tier and its *N rely on this* count are only as accurate as the bundle is well-formed (valid `base_iri`, consistent ids, well-shaped `verified`/`generated` fields), so keep it schema-valid - with LOKF Registrar in the editor, or `lokf validate` / the librarian in CI. It does not derive concepts from a repository - that is the librarian. And it does not check a claim against its source itself: it puts the two side by side and asks you. There is no auto-fix, no proposed correction, and no tidying of a fact you didn't ask it to touch.

## Where this fits: the "human-confirmed" tier

The companion [lokf-agent-skills](https://github.com/noelmcloughlin/lokf-agent-skills) project describes four levels of trust a claim in a bundle can earn: **schema-valid** (the frontmatter is well-formed and its relations resolve), **source-consistent** (an agent re-checked it against its source), **human-confirmed** (a named person vouches for it), and **proven-in-use** (a real question got answered from it). Each proves less than its name suggests, and only the third yields a claim someone has agreed to stand behind. This plugin is that third tier, in the editor: the `lokf-curator` skill's review session, available without an agent in the loop.

There is no dependency in any direction. This plugin reads Markdown and YAML and works on any LOKF bundle however it was produced - by hand, by the `lokf` CLI, or by the skills - and never loads or calls into a skill, an agent, or another plugin; the skills don't need it either. All they share is the LOKF specification. LOKF Registrar sits one tier below, equally independent - neither plugin detects whether the other is installed.

## Where the bundle lives, host by host

The plugin sees a vault; where that vault's folder sits in the wider world is the sidecar's business - but it decides what the review card can open and what syncs. The skills lay down one layout everywhere: `.lokf/knowledge/` is the real folder, and `knowledge_bundle` beside it is a link (a junction on Windows) so folder pickers, which hide dot-folders, have a name to open.

- **A code repository.** The librarian derives the bundle from code and docs; you confirm it in `knowledge_bundle` opened as a vault. Concepts cite sources that sit *above* that small vault - `src/…`, `docs/…` - so the review card shows those as a path with a copy button, and says it cannot open them for you rather than pretending to have checked.
- **Your vault, kept in git.** Run the skills at the host and the sidecar lands beside your notes. `.lokf/` is a dot-folder your vault never indexes, and the doorway link resolves inside the vault, so Obsidian skips that too: your main vault never sees the bundle, and you curate in a second vault opened through the doorway. One repository, not two - the bundle travels with the notes it was distilled from, and splitting it into a repository of its own is a later choice for a team, never a starting one.
- **A shared drive or a SharePoint library.** The sidecar is just files and syncs as such (Microsoft's list of restricted OneDrive and SharePoint names has nothing against a leading dot), but OneDrive syncs neither symbolic links nor junctions, so the doorway is per machine (`just lokf-link` in `.lokf/`) or the bundle is opened by path. A team that wants a synced, visible folder may rearrange by hand - a real `knowledge_bundle/` with `.lokf/knowledge` linking onto it; the skills' `portability.md` says how - and this plugin then detects the folder as a bundle inside a vault (README, *Where it works*), with the same cost if the shared folder is also a vault.
- **Many hosts, one vault.** Obsidian follows a link whose target lies *outside* the vault. Link each repository's `.lokf/knowledge` into a folder of your own vault (`projects/acme-knowledge → ~/git/acme/.lokf/knowledge`) and list those folders under *Bundle root folders*: every bundle you curate, in one vault, beside the notes you keep about them - and the sources now sit inside the vault, so the review card can open them side by side. This is the one arrangement that puts exhibits in your vault's index, with the cost the README names; keep such links out of Obsidian Sync, which does not carry them.

What Obsidian 1.13.7's file reconciler does with a link on each host is recorded in the skills' own playbook, [Open the knowledge bundle in Obsidian](https://github.com/noelmcloughlin/lokf-agent-skills/blob/main/.lokf/knowledge/playbooks/open-bundle-in-obsidian.md).

## On the feedback file

`.lokf/feedback.md` - where the docent records what the bundle couldn't answer - lives *beside* `knowledge/`, not inside it. If the vault is the bundle itself - a `knowledge_bundle/` folder opened as its own vault - the file sits one level above the vault; if the vault is a repository root, it is inside a dot-folder Obsidian never indexes. Either way the report says "not reachable from this vault" rather than a false "none". Set *Settings → Feedback* only for the rare layout where the file really is reachable.
