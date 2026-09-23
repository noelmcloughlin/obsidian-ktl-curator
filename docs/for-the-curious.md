# For the curious: what gets computed, and what it rests on

[The README](../README.md) says everything you need to use KTL Curator. This page says how each label is computed, what the plugin leaves to others, and where the bundle can live.

## The trust labels, and the fields they come from

Every label is arithmetic over frontmatter, computed afresh on each refresh and never stored:

| Label | Rule |
|---|---|
| Confirmed by a person | any `verified[].by` starts with `human:` |
| Checked by automation only | `verified` present, no `human:` actor |
| Nobody has checked this yet | no `verified` key at all |
| Still a draft | `status: draft` |
| Retired | `status: deprecated`. Counted once, then excluded from every other label and the queue |
| Edited since a person last confirmed it | `generated.at` later than the newest `human:` `verified[].at` |
| Past its review date / due soon | `stale_after` against today |
| *N* other concepts rely on this | concepts whose typed relations target this concept's `id`, across every configured bundle |
| Doesn't fit the known vocabulary | `type` outside the classes listed under *Settings → Type vocabulary*: the pinned LOKF schema's, plus a domain schema's where a bundle has one. Cosmetic; it never moves a concept into the queue |

The rules, with every parsing edge case, are in `references/trust-fields.md` in the `ktl-curator` skill: a bare `verified` mapping, an exact `## Open questions` heading versus a passing mention in prose, cross-bundle relation targets. This plugin implements that document and does not relax or restate it.

## What this plugin leaves to others

Three things are left to others. Schema validation is [KTL Registrar](https://github.com/noelmcloughlin/obsidian-ktl-registrar)'s, at the tier below, and this plugin assumes it: a concept's tier and its *N rely on this* count are only as accurate as the bundle is well-formed, with a valid `base_iri`, consistent ids and well-shaped `verified` and `generated` fields. Keep it schema-valid with KTL Registrar in the editor, or with `lokf validate` or the **librarian** in CI. Deriving concepts from a repository is the **librarian**'s. Checking a claim against its source is yours: the plugin puts the two side by side and asks. There is no auto-fix, no proposed correction, and no tidying of a fact you did not ask it to touch.

## Where this fits: the "human-confirmed" tier

The companion [knowledge-trust-ladder](https://github.com/noelmcloughlin/knowledge-trust-ladder) project describes four levels of trust a claim in a bundle can earn: **schema-valid**, the frontmatter is well-formed and its relations resolve; **source-consistent**, an agent re-checked it against its source; **human-confirmed**, a named person vouches for it; and **proven-in-use**, a reader's question was answered from it. Each proves less than its name suggests, and only the third yields a claim someone has agreed to stand behind. This plugin is that third tier in the editor: the `ktl-curator` skill's review session, available without an agent in the loop.

There is no dependency in either direction. This plugin reads Markdown and YAML and works on any LOKF bundle however it was produced: by hand, by the `lokf` CLI, or by the skills. It never loads or calls a skill, an agent or another plugin, and the skills do not need it either. All they share is the LOKF specification. KTL Registrar sits one tier below and is equally independent; neither plugin detects whether the other is installed.

## Where the bundle lives, host by host

The plugin sees a vault. Where that vault's folder sits is the **sidecar**'s business, and the skills' page [The bundle in Obsidian](https://github.com/noelmcloughlin/knowledge-trust-ladder/blob/main/docs/obsidian.md#where-the-bundle-lives-host-by-host) walks through the layouts: a code repository, a vault kept in git, a shared drive, and many hosts in one vault. What the layout decides here is whether the review card can open a source. In a code repository the sources sit above the bundle's small vault, so the card shows them as a path with a copy button and says it cannot open them. With several repositories' bundles linked into one vault and listed under *Bundle root folders*, the sources sit inside the vault and the card opens them side by side. Keep such links out of Obsidian Sync, which does not carry them.

## On the feedback file

`.lokf/feedback.md`, where the **docent** records what the bundle could not answer, lives beside `knowledge/`, not inside it. If the vault is the bundle itself, a `knowledge_bundle/` folder opened as its own vault, the file sits one level above the vault. If the vault is a repository root, the file is inside a dot-folder Obsidian never indexes. Either way the report says "not reachable from this vault" rather than a false "none". Set *Settings → Feedback* only for the rare layout where the file is reachable.
