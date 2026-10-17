# Install

This page says how to get a bundle, where to install KTL Curator, and how to start. [Using it](using.md) lists what the plugin does once it runs.

> **Only want to ask?** Install `ktl-docent` into any agent you use, by a route from [the install page](https://w3id.org/ktl/docs/install/), and ask it about this plugin. It answers from the bundle and says how far each answer has been checked.

## Quick start

1. **Get a bundle.** At the host, run `ktl-sidecar` once and then `ktl-librarian` to derive concepts from your sources, every one marked a draft. A bundle grown by hand with KTL Registrar works too, once it has a concept, a source, and a person to read one against the other.
2. **Open it as an Obsidian vault.** Choose **File → Open folder as vault**, and pick `knowledge_bundle`.
3. **Install the plugin there** ([Install](#install)), in that vault's `.obsidian/plugins/`, not in your workshop. In a vault with no bundle, it reads *Curate: no bundle* and does nothing. Install KTL Registrar beside it.
4. **Review.** Click the status-bar item or the ribbon's gem, pick a card from *Worth ten minutes today*, read the source beside the claim, and press one of five buttons. The first verb asks for your **curator id**, a short lowercase name with hyphens (`ada-lovelace`), recorded on every verdict as `human:<id>`. Never use an email address: the bundle may be public.

## Install

The plugin is not yet in the community plugin store. Install it in the bundle's vault, at `<bundle>/.obsidian/plugins/ktl-curator/`.

- **From a [GitHub release](https://github.com/noelmcloughlin/obsidian-ktl-curator/releases)**: copy `main.js`, `manifest.json` and `styles.css` into that folder and enable the plugin under **Settings → Community plugins**.
- **[BRAT](https://github.com/TfTHacker/obsidian42-brat)**: add `noelmcloughlin/obsidian-ktl-curator` as a beta plugin. BRAT installs the latest release and keeps it updated.
- **From source**: `npm ci && npm run build`, then copy the same three files.

The plugin requires Obsidian **1.13.0** or later.
