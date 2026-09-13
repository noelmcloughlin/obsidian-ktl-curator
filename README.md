# LOKF Curator

> "We lasso the world with networks of silver-coloured Italian hemp,\
> We bind down the world into some sort of order;\
> We balance the earth in a pair of scales of our own devising."\
> — Amy Lowell, *The Congressional Library* (1922)

If you keep a structured knowledge base in Obsidian - a wiki, a team's shared brain, documentation for a project - this plugin tells you how far it has actually been checked, and records what you decide about it. No servers, no setup beyond installing it: open a vault, and a status-bar item reads **Confirmed 12/40** - or, when you're editing a concept, that note's own tier beside the count, **Draft · 3/12**.

It speaks a particular dialect of structured notes called **LOKF** (Linked Open Knowledge Format, layered on OKF v0.2 - more in [What gets computed](docs/for-the-curious.md)). A folder of notes written that way is a **knowledge bundle**: one concept per note, a little frontmatter on each, and an `index.md` at the folder's root that names the bundle. Two words this README keeps coming back to: the bundle is the **exhibition**, and each concept in it an exhibit - the checked, curated part of what you know, as against the workshop of ordinary notes around it. This plugin reads the trust fields OKF v0.2 already defines on each of those notes - `verified`, `generated`, `status`, `stale_after` - and records what *you* say about a concept. It never invents a fact about one.

If the [`lokf-agent-skills`](https://github.com/noelmcloughlin/lokf-agent-skills) are the library's staff - one lays the network, one binds it into order, one holds the scales, one guides the visitors - Obsidian is the desk where the one who holds the scales sits - and that one is always a person: the **curator** is a named human, never a tool. Two plugins work at that desk. **LOKF Curator** - this one - is the curator's assistant, named for whom it serves: it puts the source beside the claim and writes down what the person decided. Its sibling [LOKF Registrar](https://github.com/noelmcloughlin/obsidian-lokf-registrar) is the **registrar**, and named for it: it checks that each record is well-formed as it is written. **Neither reaches a verdict of its own: the registrar keeps the paperwork straight, the assistant keeps the record of the decisions, and the judging stays with the person.**

*New to LOKF, with just a vault of ordinary notes? Start at [How this fits](#how-this-fits-the-sidecar-the-doorway-and-your-vault).*

> **Two ways in.** This README is one; the other is a docent. Install [`lokf-docent`](https://github.com/noelmcloughlin/lokf-agent-skills) into whatever agent you already use - `npx skills add noelmcloughlin/lokf-agent-skills --skill lokf-docent --yes` - and ask it anything about this project - *What does "Confirmed 12/40" rest on?*, say. It answers from `.lokf/knowledge/`, the checked part of what the project knows, says how far each answer has been trusted (still a draft, checked by automation only, or confirmed by a named person), opens the source for exact values, and records what it couldn't answer so the gap gets filled. One door for a person at a prompt, an agent reading this file, or a chatbot that can load a skill. **Agents:** if `.lokf/knowledge/index.md` exists, read it first - `llms.txt` says how to weigh it.

## Why a vault needs a catalogue

The knowledge is already in the vault. What's missing is a way to tell, at a glance, which of it is still sound - and without that you end up re-checking everything yourself, which is the work the vault was supposed to save you, while the notes quietly go stale.

So every concept says how far it has been checked, in plain words:

- **Confirmed by a person** - a named person checked it against its source.
- **Checked by automation only** - automation re-checked that the source still matches; no person has.
- **Nobody has checked this yet** - no check of any kind is recorded.
- **Still a draft**, **edited since a person last confirmed it**, **past its review date**, **retired** - and, for prioritising, how many other concepts rely on each one.

Those labels are computed from the frontmatter every time the panel refreshes, never stored, so they cannot drift from what they describe. The number to watch is **confirmed by a person: n of N**, and it is meant to rise slowly - a handful of concepts in a sitting, cumulative and partial by design. A small, young bundle can reach fully-confirmed quickly; a large or fast-growing one never quite does, and the report says so instead of pretending.

## How this fits: the sidecar, the doorway, and your vault

The pattern every LOKF tool is built around is a **sidecar**: a folder of curated knowledge kept *beside* the raw material it was distilled from - beside the code in a repository, beside the notes in a vault, beside the documents in a shared drive - in the same folder tree and, almost always, the same git repository. The sidecar is `.lokf/`. The bundle inside it is `.lokf/knowledge/` - and, because a dot-folder is hidden from folder pickers, the bundle also goes by a visible name, `knowledge_bundle`. One of the two is the real folder and the other a link onto it; the host decides which ([below](#three-places-a-bundle-can-live)), and nothing else about the bundle changes. Obsidian users already live with this shape: `.obsidian/` is a sidecar too - configuration kept beside your notes, in a dot-folder the app manages and the file explorer never shows. `.lokf/` is a second one, holding the knowledge somebody is prepared to vouch for.

### Where Obsidian comes in

Obsidian is the **curator's desk** - the curator being a person, you, and this plugin the assistant at your elbow. However the bundle was produced - by hand, or derived by the [`lokf-agent-skills`](https://github.com/noelmcloughlin/lokf-agent-skills) with every concept marked a draft - the person who confirms it works in Obsidian, and reaches the bundle one of two ways. Beside code, `knowledge_bundle` is a link: **File → Open folder as vault**, pick it, and the bundle opens as a small vault of its own, every note a concept, nothing to configure - Obsidian treats a linked folder like any other vault and keeps its workspace state inside it (the real `.lokf/knowledge/.obsidian/`, which the sidecar's gitignore expects); on Windows the link is a junction (`mklink /J knowledge_bundle .lokf\knowledge`, no administrator rights), and where a sync service has dropped it you open `.lokf/knowledge` by typing the path. Inside your own vault, `knowledge_bundle/` is a real folder among your notes and you open nothing new: this plugin finds it on its own. Same desk either way: the panel shows the drafts ranked by what most needs a person, the review card puts each source beside its claim, and your verdict is written into the note itself.

The skills and the plugins never call each other. The skills run where an agent runs, in a terminal at the host; the plugins run in Obsidian; the bundle is the only thing they share. This plugin *is* the `lokf-curator` skill, done at the desk instead of in a terminal - the same review session, the same five verbs, the same fields written, specified by the same two reference files - and, like the skill, it is the curator's assistant, not the curator: the verdicts are yours. Role by role:

| Role | In a terminal, or in CI | In Obsidian |
| --- | --- | --- |
| Sets up the sidecar | `lokf-sidecar` skill, once | - (a hand-made bundle starts from LOKF Registrar's **Insert the bundle's semantic header**) |
| **Librarian** - derives concepts from sources, keeps them fresh, leaves open questions | `lokf-librarian` skill, on a schedule | - (deriving is an agent's job; **Record something missing** is how a person leaves the librarian a task) |
| **Registrar** - keeps every record well-formed and its provenance paperwork straight; clerical, so tools do it | `lokf validate`; the `knowledge-registrar.yaml` gate on each pull request | [LOKF Registrar](https://github.com/noelmcloughlin/obsidian-lokf-registrar), as you type |
| **Curator** - always a person; confirms, corrects, retires, sends back | the `lokf-curator` skill's review session - the person's assistant in a terminal | **LOKF Curator** - the same assistant in Obsidian |
| **Docent** - answers readers from the bundle | `lokf-docent` skill; `lokf serve` for SPARQL queries and a graph view | - (readers open the vault; nothing in Obsidian writes on a reader's behalf) |

### Three places a bundle can live

**A code repository.** The librarian derives the bundle from code and docs; you confirm it through the doorway. Concepts cite sources that sit *above* the small vault you opened - `src/…`, `docs/…` - so the review card shows those as a path with a copy button, and says it cannot open them for you rather than pretending to have checked.

**Your vault, kept in git.** Run the skills at the host and the sidecar is created beside your notes. If the host is a vault, `lokf-sidecar` sets the bundle up the visible way round: `knowledge_bundle/` is a real folder among your notes - explorer, graph, search and sync like any other, and inside the vault even when the vault is a subfolder of the repository - and `.lokf/knowledge` is the link the tools follow. This plugin recognises that folder with nothing to configure - its health line and queue cover the bundle, never your notes - and you can still open it on its own, as a smaller vault, when you want to focus. Prefer the hidden layout instead and your main vault simply never sees the sidecar: Obsidian indexes neither a dot-folder nor a link that resolves back inside the vault, so notes and bundle never index one file twice - the one hazard behind its caution about nested vaults - and you curate in a second vault opened through the doorway. Either way it is one repository, not two: the bundle travels with the notes it was distilled from, and splitting it into a repository of its own is a later choice for a team, never a starting one.

**A shared drive or a SharePoint library.** The sidecar is just files, and the visible layout is the natural fit: `knowledge_bundle/` syncs as an ordinary folder, and so does `.lokf/` (Microsoft's list of restricted OneDrive and SharePoint names has nothing against a leading dot). Only the tools' link is per-machine, because OneDrive syncs neither symbolic links nor junctions - `just lokf-link` recreates it.

**Many hosts, one vault.** Obsidian follows a link whose target lies *outside* the vault. Link each repository's `.lokf/knowledge` into a folder of your own vault (`projects/acme-knowledge → ~/git/acme/.lokf/knowledge`) and list those folders under *Bundle root folders*: every bundle you curate, in one vault, beside the notes you keep about them - and the sources now sit inside the vault, so the review card can open them side by side. Keep such links out of Obsidian Sync, which does not carry them.

### Am I supposed to migrate my vault into a bundle?

No - and it is never the goal. Your vault is the **workshop**: quick notes, half-thoughts, everything that makes Obsidian yours. The bundle is the **exhibition**: the part you would hand to a teammate, a new hire, a CI gate, or an agent answering questions on your behalf, because every record in it says what it is, what it relates to, where it came from, and who last checked it. This plugin is the "who last checked it" part. Some vaults are exhibitions by nature - a team wiki, a handbook - and then the vault simply *is* the bundle. Most personal vaults instead keep a bundle as a folder among their folders, or grow one in a sidecar. What moves into a bundle is *curated* knowledge - what someone is willing to put on **exhibit** and keep standing behind - which is exactly why the confirmed count is meant to rise slowly.

### The short version

1. Make or keep your vault the Obsidian way.
2. Decide what hosts the bundle: a code repository, your vault, or a shared folder - and whether the whole vault is the bundle, or a folder in it, or the sidecar beside it.
3. Install LOKF Registrar to keep the records well-formed, and this plugin to confirm them.
4. If you want an agent to build the bundle and keep it up to date: in a terminal at the host, install the [skills](https://github.com/noelmcloughlin/lokf-agent-skills), run `lokf-sidecar` once, then `lokf-librarian`.
5. Open the bundle - the `knowledge_bundle/` folder as its own vault, or as a folder inside yours - open the panel, take the next card, decide. A handful per sitting is the intended pace.

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

1. If the root `index.md` carries a LOKF header, the whole vault is the bundle - the case whenever you open a `knowledge_bundle/` folder as its own vault, or for any vault that is a bundle outright - and the plugin reads all of it; that header is what gives each concept its id.
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

The sections above are everything you need to use the plugin. The reasoning behind it - how each trust label is computed and from which fields, what is left to LOKF Registrar and the librarian, where the plugin sits on the four-tier trust model, and why the feedback file is rarely reachable from a vault - is in [docs/for-the-curious.md](docs/for-the-curious.md).

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
