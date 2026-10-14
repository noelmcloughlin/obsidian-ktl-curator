# Using KTL Curator

This page lists the panel, the review card and its five verbs, the in-editor aids, the commands and the settings. [Install](install.md) gets the plugin running, and [the architecture](architecture.md) says what a bundle is.

## The panel

**The panel** opens from the status bar, the ribbon, or **Open curator panel**:

- The **health line** as chips: confirmed by a person, checked by automation only, nobody's checked, drafts, past review, edited since confirmed, retired. These labels overlap, and only the total is a total. What each label rests on is on the skills' architecture page under [Trust stays visible](https://github.com/noelmcloughlin/knowledge-trust-ladder/blob/main/docs/architecture.md#trust-stays-visible), and the exact rule per label in [docs/for-the-curious.md](for-the-curious.md#the-trust-labels-and-the-fields-they-come-from).
- **Worth ten minutes today**: up to five concepts, ranked by what most needs a person: past its review date or edited since confirmed, then drafts with open questions, then the wholly unchecked. Within each, most-relied-upon first.
- **Open questions the librarian left**: what a previous pass flagged and could not settle alone.
- The **active note**, pinned, with its labels and a *Review this note* button.

## The review card

**The review card** shows the evidence before the question: the source (opened side by side when it is in the vault), the claim, the concept's current labels, and then *does the source still say this?* Five buttons answer it. **Wrong - send back** has focus by default, so a stray Enter never confirms something unread.

| Verb | What gets written into the concept |
| --- | --- |
| **Confirm** | your `verified` event appended, `draft` cleared, the next review date you accepted |
| **Wrong - send back** | `status: draft`, and your note under `## Open questions` for the librarian |
| **Wrong - I corrected it** | you make the edit yourself; this records that you authored it, and confirms it |
| **Retire** | `status: deprecated`, plus its own dated line in the bundle's `log.md` |
| **Later** | keeps it a draft; a review date only if you type one |

Everything but **Later** also keeps one running `**Curation**` line under today's date in the bundle's `log.md`. Beyond that the plugin writes nothing: not `type`, not a relation, not a word of body text outside `## Open questions`, and never an existing `verified` event. One concept, one verb, one person's answer; there is no *confirm all*. In a repository the skills' CI gate, `knowledge-registrar.yaml`, checks each pull request that a new confirmation is backed by that person's approval of the pull request or their verified signature on the commit that recorded it.

## In the editor

**In the editor**, a concept's frontmatter carries a small tier badge (*Confirmed*, *Automation*, *Unchecked*, *Draft*, *Retired*), and autocomplete offers the values a curator hand-types: the `human:<id>` actor, the lifecycle `status`, and dates for `at` and `stale_after`. Both work on raw frontmatter (Source mode) and switch off under *Settings → In-editor*.

## Commands

**Commands.** Open the command palette and search for **KTL Curator**:

| Command | What it does |
| --- | --- |
| Open curator panel | Opens or focuses the *Curate* side panel |
| Review the next concept in the queue | Opens the review card for the top of *Worth ten minutes today* |
| Review the active note | Opens the review card for the note you are editing |
| Look up a LOKF field | Searchable reference of the LOKF frontmatter fields |
| Create curation policy | Writes `policies/knowledge-curation.md`, the table that sets how often each kind of concept is re-confirmed |
| Record something missing | Writes a placeholder concept - type, title, one open question - for the librarian to fill in |

The confirmed count is meant to rise slowly, a handful of concepts in a sitting. A large or fast-growing bundle never quite reaches fully-confirmed, and the report says so.

## Settings

Under **Settings → KTL Curator**; every setting is also reachable through Obsidian's settings search.

- **Who is curating**: the curator id.
- **In-editor**: the tier badge and the autocomplete, both on by default.
- **Scope**: the bundle-root settings above, and excluded folders.
- **Type vocabulary**: the classes a concept's `type` may name, defaulting to the pinned LOKF schema's fifteen. A bundle validated against a domain schema (`lokf validate --schema <file>`, [recipe](https://github.com/noelmcloughlin/knowledge-trust-ladder/blob/main/skills/ktl-librarian/references/domain-schema.md)) lists that schema's classes here too, since the plugin cannot read the schema, which sits outside the vault. Listed, they stop counting against *Vocabulary fit* and `policies/knowledge-curation.md` can set a review interval for them. Keep it the same list as KTL Registrar's *Known LOKF types*.
- **Review intervals**: months before a person should re-confirm each of three groups of concept (services and data; policies and documents; glossary terms and explanations), and whether a bundle's own `policies/knowledge-curation.md` wins over them when it exists.
- **Queue**: how many concepts *Worth ten minutes today* shows, and how far ahead *due soon* looks.
- **Feedback**: an optional path to `.lokf/feedback.md`, for the rare vault layout where it is reachable at all ([why it usually is not](for-the-curious.md#on-the-feedback-file)).
