# For the curious: what gets computed, and what it rests on

[Install](install.md) and [Using it](using.md) say everything you need to use KTL Curator. This page says how each label is computed, what the plugin leaves to others, and where the bundle can live.

## The trust labels, and the fields they come from

Every label is arithmetic over frontmatter, computed afresh on each refresh and never stored:

| Label | Rule |
|---|---|
| Confirmed by a person | any `verified[].by` starts with `human:` |
| Checked by automation only | `verified` holds events, none by a `human:` actor |
| Nobody has checked this yet | no `verified` key, or one with no events |
| Still a draft | `status: draft` |
| Retired | `status: deprecated`. Counted once, then excluded from every other label and the queue |
| Edited since a person last confirmed it | `generated.at` later than the newest `human:` `verified[].at` |
| Past its review date / due soon | `stale_after` against today |
| *N* other concepts rely on this | concepts whose typed relations target this concept's `id`, across every configured bundle; each relying concept counts once, and a retired concept counts for none and is counted for none |
| Doesn't fit the known vocabulary | `type` outside the classes listed under *Settings → Type vocabulary*: the pinned LOKF schema's, plus a domain schema's where a bundle has one. Cosmetic; it never moves a concept into the queue |

The rules, with every parsing edge case, are in `references/trust-fields.md` in the `ktl-curator` skill: a bare `verified` mapping, an exact `## Open questions` heading versus a passing mention in prose, cross-bundle relation targets. This plugin implements that document and does not relax or restate it.

## What this plugin leaves to others

Three things are left to others. Schema validation is [KTL Registrar](https://github.com/noelmcloughlin/obsidian-ktl-registrar)'s, at the tier below: a concept's tier and its *N rely on this* count are only as accurate as the bundle is well-formed, so keep it schema-valid with KTL Registrar in the editor, or with `lokf validate` or the **librarian** in CI. Deriving concepts from a repository is the **librarian**'s. Checking a claim against its source is yours: the plugin puts the two side by side and asks, and proposes no correction.

## Where this fits: the "human-confirmed" tier

The companion [knowledge-trust-ladder](https://github.com/noelmcloughlin/knowledge-trust-ladder) project describes [four levels of trust](https://github.com/noelmcloughlin/knowledge-trust-ladder/blob/main/docs/for-the-curious.md#four-levels-of-checking) a claim in a bundle can earn:

- **schema-valid**: the frontmatter is well-formed and its relations resolve;
- **source-consistent**: an agent re-checked it against its source;
- **human-confirmed**: a named person vouches for it;
- **proven-in-use**: a reader's question was answered from it.

Each proves less than its name suggests, and only the third yields a claim someone has agreed to stand behind. This plugin is that third tier in the editor: the `ktl-curator` skill's review session, available without an agent in the loop.

This plugin never loads or calls a skill, an agent or another plugin, and KTL Registrar, one tier below, is equally independent: neither plugin detects whether the other is installed.

## Where the bundle lives, host by host

The skills' page [The bundle in Obsidian](https://github.com/noelmcloughlin/knowledge-trust-ladder/blob/main/docs/obsidian.md#where-the-bundle-lives-host-by-host) walks through the layouts: a code repository, a vault kept in git, a shared drive, and many hosts in one vault. The layout decides whether the review card can open a source. In a code repository the sources sit above the bundle's vault, so the card shows them as a path with a copy button. With several repositories' bundles linked into one vault and listed under *Bundle root folders*, the sources sit inside the vault and the card opens them side by side. Obsidian Sync does not carry such links.

## On the feedback file

`.lokf/feedback.md`, where the **docent** records what the bundle could not answer, lives beside `knowledge/`, not inside it. If the vault is the bundle itself, a `knowledge_bundle/` folder opened as its own vault, the file sits one level above the vault. If the vault is a repository root, the file is inside a dot-folder Obsidian never indexes. Either way the report says "not reachable from this vault" rather than a false "none". Set *Settings → Feedback* only for the rare layout where the file is reachable.
