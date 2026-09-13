# LOKF Curator

> "We lasso the world with networks of silver-coloured Italian hemp,\
> We bind down the world into some sort of order;\
> We balance the earth in a pair of scales of our own devising."\
> — Amy Lowell, *The Congressional Library* (1922)

If you keep a structured knowledge base in Obsidian - a wiki, a team's shared brain, documentation for a project - this plugin tells you how far it has actually been checked, and records what you decide about it. No servers, no setup beyond installing it: open a vault, and a status-bar item reads **Confirmed 12/40** - or, when you're editing a concept, that note's own tier beside the count, **Draft · 3/12**.

> **What this plugin is for.** Your Obsidian vault is your **workshop**; nothing here touches it. The plugin works on the **exhibition** generated from it: a separate folder of knowledge notes that follow the Linked Open Knowledge Format (LOKF), a few properties on each, that you open in Obsidian as a vault of its own. Running the [`lokf-agent-skills`](https://github.com/noelmcloughlin/lokf-agent-skills) builds and refreshes that folder from your workshop; this plugin is the same work at your desk, showing how far each note in it has been checked and writing down what you decide. It does not need the skills - the folder is only Markdown, and you can grow one by hand - but the two were designed together, and that is where it is most valuable. [Where it works](#where-it-works-the-exhibition-not-the-workshop) has the three arrangements.

It speaks a particular dialect of structured notes called **LOKF** (Linked Open Knowledge Format, layered on OKF v0.2 - more in [What gets computed](docs/for-the-curious.md)). A folder of notes written that way is a **knowledge bundle**: one concept per note, a little frontmatter on each, and an `index.md` at the folder's root that names the bundle. That folder is the exhibition, and each concept in it an **exhibit** - the checked, curated part of what you know. This plugin reads the trust fields OKF v0.2 already defines on each of those notes - `verified`, `generated`, `status`, `stale_after` - and records what *you* say about a concept. It never invents a fact about one.

If the [`lokf-agent-skills`](https://github.com/noelmcloughlin/lokf-agent-skills) are the library's staff - one lays the network, one binds it into order, one holds the scales, one guides the visitors - Obsidian is the desk where the one who holds the scales sits - and that one is always a person: the **curator** is a named human, never a tool. Two plugins work at that desk. **LOKF Curator** - this one - is the curator's assistant, named for whom it serves: it puts the source beside the claim and writes down what the person decided. Its sibling [LOKF Registrar](https://github.com/noelmcloughlin/obsidian-lokf-registrar) is the **registrar**, and named for it: it checks that each record is well-formed as it is written. **Neither reaches a verdict of its own: the registrar keeps the paperwork straight, the assistant keeps the record of the decisions, and the judging stays with the person.**

*New to LOKF, with just a vault of ordinary notes? Start at [Where it works](#where-it-works-the-exhibition-not-the-workshop).*

> **Two ways in.** This README is one; the other is a docent. Install [`lokf-docent`](https://github.com/noelmcloughlin/lokf-agent-skills) into whatever agent you already use - `npx skills add noelmcloughlin/lokf-agent-skills --skill lokf-docent --yes` - and ask it anything about this project - *What does "Confirmed 12/40" rest on?*, say. It answers from `.lokf/knowledge/`, the checked part of what the project knows, says how far each answer has been trusted (still a draft, checked by automation only, or confirmed by a named person), opens the source for exact values, and records what it couldn't answer so the gap gets filled. One door for a person at a prompt, an agent reading this file, or a chatbot that can load a skill. **Agents:** if `.lokf/knowledge/index.md` exists, read it first - `llms.txt` says how to weigh it.

## Why a vault needs a catalogue

The knowledge is already in the vault. What's missing is a way to tell, at a glance, which of it is still sound - and without that you end up re-checking everything yourself, which is the work the vault was supposed to save you, while the notes quietly go stale.

So every concept says how far it has been checked, in plain words:

- **Confirmed by a person** - a named person checked it against its source.
- **Checked by automation only** - automation re-checked that the source still matches; no person has.
- **Nobody has checked this yet** - no check of any kind is recorded.
- **Still a draft**, **edited since a person last confirmed it**, **past its review date**, **retired** - and, for prioritising, how many other concepts rely on each one.

Those labels are computed from the frontmatter every time the panel refreshes, never stored, so they cannot drift from what they describe. The number to watch is **confirmed by a person: n of N**, and it is meant to rise slowly - a handful of concepts in a sitting, cumulative and partial by design. A small, young bundle can reach fully-confirmed quickly; a large or fast-growing one never quite does, and the report says so instead of pretending.

## Where it works: the exhibition, not the workshop

The bundle is a **sidecar**: a folder of curated knowledge kept *beside* the raw material it was distilled from - `.lokf/knowledge/` next to the code in a repository, the notes in a vault, or the documents in a shared drive - with a `knowledge_bundle` link beside it, so folder pickers, which hide dot-folders, have a name to open. Obsidian users already live with this shape: `.obsidian/` is a sidecar too. Three ways to meet one:

1. **Open the exhibition as its own vault** - the intended way. **File → Open folder as vault**, pick `knowledge_bundle` (or type the path `.lokf/knowledge`; to make the link yourself, `ln -s .lokf/knowledge knowledge_bundle`, on Windows `mklink /J knowledge_bundle .lokf\knowledge`, no administrator rights). Install this plugin in that vault - and LOKF Registrar, which keeps the records well-formed. Nothing to configure: a root `index.md` with a header makes the whole vault the bundle. Your own vault never lists the link - Obsidian skips a link that resolves inside the vault, and never indexes a dot-folder - so the two vaults never index the same file, and your notes stay yours.
2. **A folder inside your vault.** Also works: the plugin finds a top-level `knowledge_bundle/` on its own, and any folder you list under *Bundle root folders* (several, if one vault holds several bundles); its health line and queue cover the bundle, never your notes. Know the cost first: Obsidian indexes that folder like any other, so link suggestions, the quick switcher, graph and search will mix exhibits with everyday notes; *Settings → Files and links → Excluded files* makes them less noticeable, not gone. That is why it is not the default.
3. **The whole vault is the exhibition** - a team wiki, a handbook. Put the header on the root `index.md` (LOKF Registrar's **Insert the bundle's semantic header** does it) and every note is a record. For a vault that really is one but has no header yet, *Treat the vault root as the bundle* under *Scope* reads it anyway; it is a break-glass switch, and the plugin says so.

Your vault is never migrated into an exhibition. What moves is what you would stand behind - the notes you would hand to a teammate, a new hire, a CI gate, or an agent answering questions on your behalf - and only a few at a sitting, which is exactly why the confirmed count is meant to rise slowly. Where the sidecar sits host by host - a repository, a vault kept in git, a shared drive, many repositories into one vault - is in [Where the bundle lives](docs/for-the-curious.md#where-the-bundle-lives-host-by-host).

**With the skills.** In a terminal at the host: `lokf-sidecar` once, then `lokf-librarian` to derive the bundle from code, docs or notes, every concept marked a draft. Open `knowledge_bundle` as a vault, and this plugin ranks what most needs a person, puts each source beside its claim, and writes your verdict into the note; LOKF Registrar keeps it well-formed meanwhile. The skills and the plugins never call each other - the bundle is the only thing they share. This plugin *is* the `lokf-curator` skill, done at the desk instead of in a terminal - the same review session, the same five verbs, the same fields written, specified by the same two reference files - and, like the skill, it is the curator's assistant, not the curator: the verdicts are yours. Role by role:

| Role | In a terminal, or in CI | In Obsidian |
| --- | --- | --- |
| Sets up the sidecar | `lokf-sidecar` skill, once | - (a hand-made bundle starts from LOKF Registrar's **Insert the bundle's semantic header**) |
| **Librarian** - derives concepts from sources, keeps them fresh, leaves open questions | `lokf-librarian` skill, on a schedule | - (deriving is an agent's job; **Record something missing** is how a person leaves the librarian a task) |
| **Registrar** - keeps every record well-formed and its provenance paperwork straight; clerical, so tools do it | `lokf validate`; the `knowledge-registrar.yaml` gate on each pull request | [LOKF Registrar](https://github.com/noelmcloughlin/obsidian-lokf-registrar), as you type |
| **Curator** - always a person; confirms, corrects, retires, sends back | the `lokf-curator` skill's review session - the person's assistant in a terminal | **LOKF Curator** - the same assistant in Obsidian |
| **Docent** - answers readers from the bundle | `lokf-docent` skill; `lokf serve` for SPARQL queries and a graph view | - (readers open the vault; nothing in Obsidian writes on a reader's behalf) |

**Without the skills.** Start with LOKF Registrar: its header command makes an empty vault the exhibition, and its relation aids keep hand-written notes well-formed. Install this plugin once there is a bundle worth confirming - a concept, a source, and a person to read one against the other. Nothing refreshes the bundle for you, which is what the librarian is for.

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

**In the editor**, a concept's frontmatter carries a small tier badge - *Confirmed* / *Automation* / *Unchecked* / *Draft* / *Retired*, the same verdict the review card writes - so you can see where a note stands without opening the panel. Autocomplete offers the values a curator hand-types: the actor string (`human:<id>`), the lifecycle `status`, and dates for `at`/`stale_after` (today and each review interval). Both are on by default, work on raw frontmatter (Source mode) only, and switch off under *Settings → In-editor*.

## Install

Not yet in the community store - the first release is in preparation. Until then, the options are:

- **From source** - `npm ci && npm run build`, then copy `main.js`, `manifest.json`, and `styles.css` into `<vault>/.obsidian/plugins/lokf-curator/` and enable the plugin under **Settings → Community plugins**.
- **From a GitHub release** - once one is published, the same three files are attached to it; copy them to the same place.
- **[BRAT](https://github.com/TfTHacker/obsidian42-brat)** - add `noelmcloughlin/obsidian-lokf-curator` as a beta plugin once a release exists, and BRAT keeps it updated.

Requires Obsidian **1.13.0** or later (declarative settings API).

## Usage

**With nothing configured, what is in the vault decides.**

1. If the root `index.md` carries a LOKF header, the whole vault is the bundle - the case whenever you open the bundle folder as its own vault, whatever it is called, or for any vault that is a bundle outright - and the plugin reads all of it; that header is what gives each concept its id.
2. Otherwise, if there is a top-level `knowledge_bundle/` folder with its own `index.md`, that folder is the bundle, and every note outside it is left alone.
3. Otherwise the vault has **no bundle**: it is an ordinary notes vault, the workshop with no exhibition in it yet. No report, no queue, nothing written; the status bar reads *Curate: no bundle*, and the panel says why.

The plugin never treats a notes vault as a bundle on its own. If you want it to anyway - the whole vault really is one and its root `index.md` just has no LOKF header yet - the switch under *Settings → Scope → Treat the vault root as the bundle* does that. Inside a bundle, a note without LOKF trust fields is simply *nobody has checked this yet*; a note with no frontmatter at all is not a concept and is not counted.

**A bundle as a folder inside a larger vault, or several of them:** list the folders under *Settings → Scope → Bundle root folders* (comma-separated, e.g. `bird-watching, projects/art-portfolio`). Each becomes an independent bundle with its own `index.md`, `base_iri`, health line, and queue; *N other concepts rely on this* is counted across all of them. A note outside every listed folder is ignored entirely. A folder inside a dot-folder is accepted but only read if something has put it in Obsidian's index (the community plugin *Hidden Folders Access* does that for a folder you choose); otherwise the report says so rather than showing an empty bundle.

Open the command palette and search for **LOKF Curator**:

| Command | What it does |
|---|---|
| Open curator panel | Opens (or focuses) the "Curate" side panel |
| Review the next concept in the queue | Opens the review card for the top of "Worth ten minutes today" |
| Review the active note | Opens the review card for the note you're editing |
| Look up a LOKF field | Searchable reference of the LOKF frontmatter fields and what each one means |
| Create curation policy | Writes `policies/knowledge-curation.md`, the table that sets how often each kind of concept is re-confirmed |
| Record something missing | Writes a placeholder concept - type, title, one open question - for the librarian to fill in later |

The first verb you press asks for a **curator id** - a short lowercase name with hyphens (`ada-lovelace`), recorded on every verdict as the literal `human:<id>`. Never an email: the bundle may be public.

## Settings

Configure under **Settings → LOKF Curator**. Every setting can be found through Obsidian's settings search as well as in the tab itself.

- **Who is curating** - the curator id above.
- **In-editor** - two aids while you edit a concept's raw frontmatter: a **trust-tier badge** at the top of the frontmatter (*Confirmed* / *Automation* / *Unchecked* / *Draft* / *Retired*), and **autocomplete** for the values a curator hand-types (the `human:<id>` actor, the lifecycle `status`, and dates for `at`/`stale_after`). Both on by default; Source-mode editing only, since Live Preview shows Obsidian's Properties widget.
- **Scope** - the [bundle root folders](#usage) for a vault holding several independent bundles (left empty, a root `index.md` with a LOKF header or a top-level `knowledge_bundle/` is detected on its own, and a vault with neither has no bundle), the break-glass **Treat the vault root as the bundle** switch for the whole-vault case with no header, and excluded folders.
- **Review intervals** - months before a person should re-confirm each of the three groups of concept (services and data; policies and documents; glossary terms and explanations), and whether a bundle's own `policies/knowledge-curation.md` table wins over them when it exists.
- **Queue** - how many concepts "Worth ten minutes today" shows, and how far ahead "due soon" looks.
- **Feedback** - an optional path to `.lokf/feedback.md`, for the rare vault layout where it is reachable at all (see [On the feedback file](docs/for-the-curious.md#on-the-feedback-file)).

## For the curious

The sections above are everything you need to use the plugin. The reasoning behind it - how each trust label is computed and from which fields, what is left to LOKF Registrar and the librarian, where the plugin sits on the four-tier trust model, where the bundle lives host by host, and why the feedback file is rarely reachable from a vault - is in [docs/for-the-curious.md](docs/for-the-curious.md).

## Privacy

This plugin makes **no network requests** and has no telemetry, analytics, or external services of any kind. It reads Markdown files in the open vault, writes only through the five review verbs and the two file-creating commands (**Create curation policy**, **Record something missing**) - every write is one you asked for by pressing a button; **Look up a LOKF field** is a read-only reference - and stores its settings, including the curator id, in the vault's own plugin data. Nothing leaves your machine.

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
docs/               the reasoning behind the labels, moved out of this README
.lokf/              this repository's own LOKF knowledge bundle (a uv/Python sidecar)
```

`bundle.ts`, `trust.ts`, and `edits.ts` are deliberately import-free - no Obsidian, no YAML parser, no `Date.now()`. They take already-parsed frontmatter and, where a date matters, the day as a parameter, so the whole rule set runs under plain Node via `npm run smoke-test` and every date-dependent label is reproducible. Parsing and the clock live in `src/main.ts`, which uses Obsidian's own `metadataCache`.

## Credits

- [Nolan Nichols](https://lokf.nolan-nichols.com/), creator of [LOKF](https://lokf.nolan-nichols.com/specification/) (Linked Open Knowledge Format) and its [toolkit](https://github.com/nicholsn/lokf).
- The [LinkML Community](https://linkml.io/), creators of [LinkML](https://linkml.io/linkml/), the schema language LOKF is written in.
- [Introducing the Open Knowledge Bundle, Google blog](https://cloud.google.com/blog/products/data-analytics/how-the-open-knowledge-format-can-improve-data-sharing), creator of Open Knowledge Format specification.
- [LLM Wiki, Karpaty](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f), a pattern for building personal knowledge bases using LLMs.
- [obsidian-sample-plugin](https://github.com/obsidianmd/obsidian-sample-plugin), whose build/lint/release layout this repository follows.
- [lokf-agent-skills](https://github.com/noelmcloughlin/lokf-agent-skills) - the `lokf-curator` skill this plugin implements as an in-editor workflow, and whose trust model and plain-language labels this README shares.
- [LOKF Registrar](https://github.com/noelmcloughlin/obsidian-lokf-registrar) - the sibling plugin at the schema-valid tier, this one's fork parent, and the source of the shared bundle-root plumbing in `src/bundle.ts`.

## Alternative plugins

Nothing else records a person's verdict in LOKF's trust fields, as far as we know. For the *schema* layer beneath this plugin, validators other than LOKF Registrar exist for plain OKF v0.2 - [OKF Enforcer](https://github.com/MartinForReal/okf-enforcer), for one; they check well-formedness only and are unrelated to curation.

## About this repository's own knowledge bundle

This repository keeps a LOKF bundle of its own under `.lokf/knowledge/` - documentation about the plugin, in the format the plugin computes trust over. It is maintained by the [lokf-agent-skills](https://github.com/noelmcloughlin/lokf-agent-skills), which a scheduled [workflow](.github/workflows/knowledge-librarian.yaml) installs at run time (they are never committed - `.agents/`, `.claude/`, and `skills-lock.json` are git-ignored). None of this is part of the plugin - you don't need any skill to use it. It is also what the docent answers from: install `lokf-docent` and ask about this plugin instead of reading the whole README - the notice at the top says how. If you want to contribute to that bundle, [CONTRIBUTING.md](CONTRIBUTING.md#agent-skills-optional---only-for-editing-this-repos-own-lokf-bundle) says which skills that takes.

## Contributing

[CONTRIBUTING.md](CONTRIBUTING.md) covers the dev setup and the pre-PR checklist; participation is covered by the [Code of Conduct](CODE_OF_CONDUCT.md), and [AI_COVENANT.md](AI_COVENANT.md) sets out how AI-assisted contributions are handled here.

## Security

Please review the repository security policy at [SECURITY.md](SECURITY.md) before using the agent-driven knowledge workflow or GitHub automation in this repo.

## License

Apache-2.0 - see [LICENSE](LICENSE) and [NOTICE](NOTICE).
