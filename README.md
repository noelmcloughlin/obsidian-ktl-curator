# LOKF Curator

> "We lasso the world with networks of silver-coloured Italian hemp,\
> We bind down the world into some sort of order;\
> We balance the earth in a pair of scales of our own devising."\
> — Amy Lowell, *The Congressional Library* (1922)

If you keep a structured knowledge base in Obsidian - a wiki, a team's shared brain, documentation for a project - this plugin tells you how far it has actually been checked, and records what you decide about it. No servers, no setup beyond installing it: open a vault, and a status-bar item reads **Confirmed 12/40**.

It speaks a particular dialect of structured notes called **LOKF** (more on that below), and reads the trust fields OKF v0.2 already defines - `verified`, `generated`, `status`, `stale_after`. It records what you say about a concept; it never invents a fact about one.

If the [`lokf-agent-skills`](https://github.com/noelmcloughlin/lokf-agent-skills) are the library's staff - one lays the network, one binds it into order, one holds the scales, one guides the visitors - the two Obsidian plugins work the **registrar's desk**, where the records themselves are kept and the paperwork has to be straight. [LOKF Enforcer](https://github.com/noelmcloughlin/obsidian-lokf-enforcer) checks that each record is well-formed as it is written. **LOKF Curator** - this one - puts the source beside the claim and writes down what a person decided. **Neither reaches a verdict of its own: a registrar keeps the provenance honest and leaves the judging to the curator.**

> **For AI agents:** if `.lokf/knowledge/index.md` exists in this repository, read it first - it is a queryable [LOKF](https://lokf.nolan-nichols.com) knowledge bundle of repository-specific context; `llms.txt` says how to weigh what you find there (drafts vs. person-confirmed) and names the `lokf-docent` skill for answering from it.

## Why a vault needs a catalogue

The knowledge is already in the vault. What's missing is a way to tell, at a glance, which of it is still sound - and without that you end up re-checking everything yourself, which is the work the vault was supposed to save you, while the notes quietly rot.

So every concept says how far it has been checked, in plain words:

- **Confirmed by a person** - a named person checked it against its source.
- **Checked by automation only** - automation re-checked that the source still matches; no person has.
- **Nobody has checked this yet** - no check of any kind is recorded.
- **Still a draft**, **edited since a person last confirmed it**, **past its review date**, **retired** - and, for prioritising, how many other concepts rely on each one.

Those labels are computed from the frontmatter every time the panel refreshes, never stored, so they cannot drift from what they describe. The number to watch is **confirmed by a person: n of N**, and it is meant to rise slowly - a handful of concepts in a sitting, cumulative and partial by design. A small, young bundle can reach fully-confirmed quickly; a large or fast-growing one never quite does, and the report says so instead of pretending.

## What it looks like

Click the status-bar item, the ribbon's gem, or run **Open curator panel**, and a side panel opens:

- The **health line** as chips - confirmed by a person, checked by automation only, nobody's checked, drafts, past review, edited since confirmed, retired. These overlap by design; only the total is a total.
- **Worth ten minutes today** - up to five concepts, ranked by what actually needs a person: past its review date or edited since confirmed, then drafts with open questions, then the wholly unchecked, then drafts only automation has looked at. Within each of those, most-relied-upon first - a glossary term twelve concepts lean on outranks a service nothing references.
- **Open questions the librarian left** - what a previous pass flagged and couldn't settle alone.
- The **active note**, pinned, with its own labels and a "Review this note" button.

Click a card and the panel becomes a review card, evidence before question: the source (opened side by side if it's in the vault), the claim, the concept's current trust labels, and then - only then - *does the source still say this?* Five buttons answer it, with **Wrong - send back** focused by default so a stray Enter never confirms something unread:

| Verb | What gets written into the concept |
| --- | --- |
| **Confirm** | your `verified` event appended, `draft` cleared, the next review date you accepted |
| **Wrong - send back** | `status: draft`, and your note under `## Open questions` for the librarian |
| **Wrong - I corrected it** | you make the edit yourself; this records that you authored it, and confirms it |
| **Retire** | `status: deprecated`, plus its own dated line in the bundle's `log.md` |
| **Later** | keeps it a draft; a review date only if you type one |

Everything but **Later** also keeps one running `**Curation**` line for you, under today's date in the bundle's `log.md` - so a session that changed nothing leaves no trace, and one you abandon halfway is still recorded. Beyond that the plugin writes nothing: not `type`, not a relationship, not a word of body text outside the `## Open questions` section, and never an existing `verified` event, which is only ever appended to.

One concept, one verb, one person's answer - there is no "confirm all", and no keyboard shortcut that fires a verb on the next card.

## Install

Not yet in the community store - the first release is in preparation. Until it lands, the options are:

- **From source** - `npm ci && npm run build`, then copy `main.js`, `manifest.json`, and `styles.css` into `<vault>/.obsidian/plugins/lokf-curator/` and enable the plugin under **Settings → Community plugins**.
- **From a GitHub release** - once one is published, the same three files are attached to it; copy them to the same place.
- **[BRAT](https://github.com/TfTHacker/obsidian42-brat)** - add `noelmcloughlin/obsidian-lokf-curator` as a beta plugin once a release exists, and BRAT keeps it updated.

Requires Obsidian **1.13.0** or later (declarative settings API).

## Usage

**By default, the vault root is the bundle root** - the plugin reads the whole open vault and treats its top-level `index.md` as the bundle's semantic header, which is what mints concept ids. Two consequences of that default:

- **A bundle inside a software repo** - the `lokf-agent-skills` convention is `.lokf/knowledge/` - must be opened *as its own vault*: **File → Open folder as vault** on the `knowledge/` folder itself. Opening the repository root as a vault does **not** work, because Obsidian's file index skips every folder whose name starts with a dot, so nothing under `.lokf/` is visible to this or any plugin.
- **A source outside the vault is common, and said plainly.** When a concept's bundle sits in `knowledge/` but its `resource` points at `src/…` in the repository, that source is a level *above* the open vault and the plugin cannot open it for you. The review card shows the path in monospace with a copy button and says so, rather than pretending to have checked it. A `#fragment` or `:42` suffix is kept as a hint and stripped for opening.

**If your vault holds several project folders and each is its own bundle** - the ordinary Obsidian pattern, one vault for everything, subfolders for projects - list them under *Settings → Scope → Bundle root folders* (comma-separated, e.g. `knowledge, projects/foo`). Each becomes an independent bundle with its own `index.md`, `base_iri`, and health line. A note outside every listed folder is ignored entirely. Leave the list empty (the default) for the common one-vault-per-bundle case above.

**A dot-folder can never be a bundle root**, however you set it - the setting rejects such an entry and says why, rather than scanning nothing and reporting a healthy, empty bundle. For a `.lokf/knowledge` bundle, open that folder as its own vault (above).

Open the command palette and search for **LOKF Curator**:

| Command | What it does |
|---|---|
| Open curator panel | Opens (or focuses) the "Curate" side panel |
| Create curation policy | Writes `policies/knowledge-curation.md`, the table that sets how often each kind of concept is re-confirmed |
| Record something missing | Writes a placeholder concept - type, title, one open question - for the librarian to fill in later |

The first verb you press asks for a **curator id** - a short slug (`ada-lovelace`), recorded on every verdict as the literal `human:<id>`. Never an email: the bundle may be public.

## Settings

Configure under **Settings → LOKF Curator**. Every setting is registered declaratively, so it is reachable from Obsidian's settings search as well as the tab itself.

- **Who is curating** - the curator id above.
- **Scope** - the [bundle root folders](#usage) for a vault holding several independent bundles, and excluded folders.
- **Review intervals** - months before a person should re-confirm each of the three groups of concept (services and data; policies and documents; glossary terms and explanations), and whether a bundle's own `policies/knowledge-curation.md` table wins over them when it exists.
- **Queue** - how many concepts "Worth ten minutes today" shows, and how far ahead "due soon" looks.
- **Feedback** - an optional path to `.lokf/feedback.md`, for the rare vault shape where it is reachable at all (see below).

## For the curious: what gets computed, and what it rests on

The sections above are everything you need to use the plugin. What follows is the reasoning behind it.

### The trust labels, and the fields they come from

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
| Doesn't fit the built-in vocabulary | `type` outside the 14 LOKF classes |

The rules, with every parsing edge case (a bare `verified` mapping, an exact `## Open questions` heading versus a passing mention of one in prose, cross-bundle relation targets), are `references/trust-fields.md` in the `lokf-curator` skill. This plugin implements that document; it does not relax or restate it.

### What this plugin leaves to others

It does not validate schema - that is [LOKF Enforcer](https://github.com/noelmcloughlin/obsidian-lokf-enforcer), at the tier below. It does not derive concepts from a repository - that is the librarian. And it does not check a claim against its source itself: it puts the two side by side and asks you. There is no auto-fix, no proposed correction, and no tidying of a fact you didn't ask it to touch.

### Where this fits: the "human-confirmed" tier

The companion [lokf-agent-skills](https://github.com/noelmcloughlin/lokf-agent-skills) project describes four levels of trust a claim in a bundle can earn: **schema-valid** (the frontmatter is well-formed and its relations resolve), **source-consistent** (an agent re-checked it against its source), **human-confirmed** (a named person vouches for it), and **proven-in-use** (a real question got answered from it). Each proves less than its name suggests, and only the third yields a claim someone has agreed to stand behind. This plugin is that third tier, in the editor: the `lokf-curator` skill's review session, available without an agent in the loop.

**None of that is a dependency.** The skills are optional companions, not a requirement. This plugin reads Markdown and YAML and works on any LOKF bundle however it was produced - by hand, by the `lokf` CLI, or by the skills - and it never requires, loads, or calls into a skill, an agent, or another plugin. The skills, in turn, do not need this plugin. The only thing they share is the LOKF specification. LOKF Enforcer is a companion on the tier below, and the two plugins are equally independent: neither detects whether the other is installed.

### On the feedback file

`.lokf/feedback.md` - where the docent records what the bundle couldn't answer - lives *beside* `knowledge/`, not inside it. If the vault is `knowledge/` itself (the usual layout), the file sits one level above the vault; if the vault is the repository root, it is inside a dot-folder Obsidian never indexes. Either way the report says "not reachable from this vault" rather than a false "none". Set *Settings → Feedback* only for the rare layout where the file really is reachable.

## Privacy

This plugin makes **no network requests** and has no telemetry, analytics, or external services of any kind. It reads Markdown files in the open vault, writes only through the five review verbs and the two commands above - every write is one you asked for by pressing a button - and stores its settings, including the curator id, in the vault's own plugin data. Nothing leaves your machine.

## Development

See [CONTRIBUTING.md](CONTRIBUTING.md). Source lives in `src/` and the build is esbuild, matching the upstream [obsidian-sample-plugin](https://github.com/obsidianmd/obsidian-sample-plugin) layout; `npm run lint` runs Obsidian's own `eslint-plugin-obsidianmd` ruleset.

```text
src/
  bundle.ts         bundle-root resolution, frontmatter split, relation targets
  trust.ts          one concept's trust record, the health counts, the ranked queue
  edits.ts          the exact write each verb makes, and the log.md upsert
  main.ts           plugin lifecycle: scanning, the review session, commands
  curator-view.ts   the "Curate" side panel: report + review card
  settings.ts       declarative settings tab (Obsidian 1.13+)
scripts/
  smoke-test.ts     the three pure modules against a fixture bundle (npm run smoke-test)
  fixtures/         a bundle with one concept per trust-label state, on purpose
.lokf/              this repository's own LOKF knowledge bundle (a uv/Python sidecar)
```

`bundle.ts`, `trust.ts`, and `edits.ts` are deliberately import-free - no Obsidian, no YAML parser, no `Date.now()`. They take already-parsed frontmatter and, where a date matters, the day as a parameter, so the whole rule set runs under plain Node via `npm run smoke-test` and every date-dependent label is reproducible. Parsing and the clock live in `src/main.ts`, which uses Obsidian's own `metadataCache`.

## Credits

- [Nolan Nichols](https://lokf.nolan-nichols.com/), creator of [LOKF](https://lokf.nolan-nichols.com/specification/) (Linked Open Knowledge Format) and its [toolkit](https://github.com/nicholsn/lokf).
- The [LinkML Community](https://linkml.io/), creators of [LinkML](https://linkml.io/linkml/), the schema language LOKF is written in.
- [obsidian-sample-plugin](https://github.com/obsidianmd/obsidian-sample-plugin), whose build/lint/release layout this repository follows.
- [lokf-agent-skills](https://github.com/noelmcloughlin/lokf-agent-skills) - the `lokf-curator` skill this plugin implements as an in-editor workflow, and whose trust model and plain-language labels this README shares.
- [LOKF Enforcer](https://github.com/noelmcloughlin/obsidian-lokf-enforcer) - the plugin at the schema-valid tier, this one's fork parent, and the source of the shared bundle-root plumbing in `src/bundle.ts`. Neither plugin depends on the other.

## About this repository's own knowledge bundle

This repository keeps a LOKF bundle of its own under `.lokf/knowledge/` - documentation about the plugin, in the format the plugin computes trust over. It is maintained by the [lokf-agent-skills](https://github.com/noelmcloughlin/lokf-agent-skills), which a scheduled [workflow](.github/workflows/knowledge-librarian.yaml) installs at run time (they are never committed - `.agents/`, `.claude/`, and `skills-lock.json` are git-ignored). **None of this is part of the plugin, and you don't need any skill to use it.** If you want to contribute to that bundle, [CONTRIBUTING.md](CONTRIBUTING.md#agent-skills-optional---only-for-editing-this-repos-own-lokf-bundle) says which skills that takes.

## Security

Please review the repository security policy at [SECURITY.md](SECURITY.md) before using the agent-driven knowledge workflow or GitHub automation in this repo.

## License

Apache-2.0 - see [LICENSE](LICENSE) and [NOTICE](NOTICE).
