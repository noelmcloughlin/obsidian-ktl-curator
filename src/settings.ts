// settings.ts - the LOKF Curator settings tab.
//
// Declarative (Obsidian 1.13.0+): the tab returns definitions rather than
// building DOM, so every setting is indexed by Obsidian's settings search.
import { App, PluginSettingTab } from "obsidian";
import type { SettingDefinitionItem } from "obsidian";
import type LokfCuratorPlugin from "./main";
import type { CuratorSettings } from "./main";
import { joinCsv, parseCsv, hiddenRootSegment } from "./bundle";

type SettingKey = keyof CuratorSettings;

/** Settings a user edits as comma-separated text but that are stored - and
 *  validated against - as string arrays. */
const CSV_KEYS = new Set<SettingKey>(["excludeFolders", "bundleRoots"]);

function isCsvKey(key: string): key is SettingKey {
  return CSV_KEYS.has(key as SettingKey);
}

const SLUG_RE = /^[a-z0-9][a-z0-9-]*$/;

export class LokfCuratorSettingTab extends PluginSettingTab {
  plugin: LokfCuratorPlugin;

  constructor(app: App, plugin: LokfCuratorPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  getControlValue(key: string): unknown {
    if (isCsvKey(key)) return joinCsv(this.plugin.settings[key] as string[]);
    return super.getControlValue(key);
  }

  async setControlValue(key: string, value: unknown): Promise<void> {
    const settings = this.plugin.settings as unknown as Record<string, unknown>;
    if (isCsvKey(key)) settings[key] = parseCsv(String(value));
    else settings[key] = value;
    await this.plugin.saveSettings();
    if (key === "bundleRoots") this.plugin.invalidateBundleCache();
    // Toggling the inline marker changes a registered editor extension's
    // behaviour; repaint open editors at once rather than on the next edit.
    if (key === "trustMarker") this.plugin.app.workspace.updateOptions();
  }

  getSettingDefinitions(): SettingDefinitionItem<SettingKey>[] {
    return [
      {
        type: "group",
        heading: "Who is curating",
        items: [
          {
            name: "Curator ID",
            desc: 'Recorded as the literal "human:<id>" on every verdict you record - never an email, the bundle may be public.',
            control: {
              type: "text",
              key: "curatorId",
              validate: (value) => {
                const v = String(value ?? "").trim();
                if (!v) return undefined;
                if (v.includes("@")) return 'Never an email - the bundle may be public. Use a short slug, e.g. "ada-lovelace".';
                return SLUG_RE.test(v) ? undefined : 'Use lowercase letters, digits, and hyphens only, e.g. "ada-lovelace".';
              },
            },
          },
        ],
      },
      {
        type: "group",
        heading: "In-editor",
        items: [
          {
            name: "Show the trust tier on a concept's frontmatter",
            desc: "Mark a concept's trust tier inline while editing (Confirmed / Automation / Unchecked / Draft / Retired), at the top of its frontmatter - the review card's verdict, where the note is edited. Raw frontmatter (Source mode) only; in Live Preview the frontmatter is Obsidian's Properties widget.",
            aliases: ["inline", "marker", "badge", "editor", "tier", "gutter"],
            control: { type: "toggle", key: "trustMarker" },
          },
          {
            name: "Suggest LOKF values as you type",
            desc: "Offer completions inside a concept's frontmatter: your actor string (human:<id>) for a verified or generated `by`, the lifecycle `status`, and dates for `at`/`stale_after` (today and each review interval). Raw-text editing only - in Live Preview, frontmatter is Obsidian's Properties widget.",
            aliases: ["autocomplete", "EditorSuggest", "completion", "actor", "status", "date"],
            control: { type: "toggle", key: "autocomplete" },
          },
        ],
      },
      {
        type: "group",
        heading: "Scope",
        items: [
          {
            name: "Bundle root folders",
            desc: "Comma-separated vault-relative folders, each the root of its own bundle (its own index.md, base_iri, ids). Leave blank if the bundle is the whole vault. List folders here only when one vault holds several independent bundles as sibling project folders; a note outside every listed folder is not scanned.",
            aliases: ["subfolder", "one vault many folders", "bundleRoots", "multiple bundles"],
            control: {
              type: "textarea",
              key: "bundleRoots",
              rows: 2,
              validate: (value) => {
                for (const entry of parseCsv(String(value ?? ""))) {
                  const segment = hiddenRootSegment(entry);
                  if (segment) {
                    return `"${entry}" sits inside "${segment}" - Obsidian's file index skips folders whose name begins with a dot, so nothing under it can ever be scanned. Open that folder as its own vault instead (File → Open folder as vault).`;
                  }
                }
                return undefined;
              },
            },
          },
          {
            name: "Excluded folders",
            desc: "Comma-separated folder paths to skip during a scan.",
            control: { type: "text", key: "excludeFolders" },
          },
        ],
      },
      {
        type: "group",
        heading: "Review intervals",
        items: [
          {
            name: "Services, datasets, tables, metrics, attested computations",
            desc: "Months between a person's confirmation and the proposed stale_after date.",
            control: { type: "number", key: "intervalMonthsGroupA", min: 1, max: 120, step: 1, defaultValue: 6 },
          },
          {
            name: "Policies, playbooks, tutorials, references, documents, people, organizations",
            control: { type: "number", key: "intervalMonthsGroupB", min: 1, max: 120, step: 1, defaultValue: 12 },
          },
          {
            name: "Glossary terms, explanations",
            control: { type: "number", key: "intervalMonthsGroupC", min: 1, max: 120, step: 1, defaultValue: 24 },
          },
          {
            name: "Prefer policies/knowledge-curation.md when present",
            desc: "Read the bundle's own curation-policy table for the interval, falling back to the settings above for any class it doesn't mention.",
            control: { type: "toggle", key: "preferPolicyFile" },
          },
        ],
      },
      {
        type: "group",
        heading: "Queue",
        items: [
          {
            name: "Queue size",
            desc: '"Worth ten minutes today" shows at most this many concepts.',
            control: {
              type: "number",
              key: "queueSize",
              min: 1,
              max: 10,
              step: 1,
              defaultValue: 5,
              validate: (value) => (Number.isInteger(value) && value >= 1 && value <= 10 ? undefined : "Enter a whole number between 1 and 10."),
            },
          },
          {
            name: "Due soon window (days)",
            desc: 'A concept is "due soon" when today is within this many days of its stale_after date.',
            control: { type: "number", key: "dueSoonDays", min: 1, max: 365, step: 1, defaultValue: 30 },
          },
        ],
      },
      {
        type: "group",
        heading: "Feedback",
        items: [
          {
            name: "Feedback file",
            desc: 'Vault-relative path to .lokf/feedback.md, only if it happens to be reachable from this vault (it usually sits outside it - see the README). Leave blank to show "not reachable" rather than "none".',
            control: { type: "text", key: "feedbackFile" },
          },
        ],
      },
    ];
  }
}
