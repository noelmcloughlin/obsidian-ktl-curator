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

## On the feedback file

`.lokf/feedback.md` - where the docent records what the bundle couldn't answer - lives *beside* `knowledge/`, not inside it. If the vault is the bundle itself - a `knowledge_bundle/` folder opened as its own vault - the file sits one level above the vault; if the vault is a repository root, it is inside a dot-folder Obsidian never indexes. Either way the report says "not reachable from this vault" rather than a false "none". Set *Settings → Feedback* only for the rare layout where the file really is reachable.
