// settings-model.ts - the settings this plugin stores, their defaults, and the
// rule that merges what `loadData()` returned onto them.
//
// Import-free of Obsidian, like bundle.ts / trust.ts / edits.ts, so the merge
// rule is testable under plain Node (scripts/smoke-test.ts). The settings *tab*
// (src/settings.ts) is Obsidian-bound and holds only presentation.

import { KNOWN_LOKF_TYPES, HARDCODED_LOKF_TYPES } from "./bundle";

export interface CuratorSettings {
  curatorId: string;
  bundleRoots: string[];
  /** Break-glass: with nothing configured and nothing detected, read a vault
   *  whose root index.md carries no LOKF header as one whole-vault bundle
   *  anyway. Off, such a vault has no bundle and the plugin stays out of it. */
  treatVaultRootAsBundle: boolean;
  excludeFolders: string[];
  intervalMonthsGroupA: number; // services/datasets/tables/metrics/attested computations
  intervalMonthsGroupB: number; // policies/playbooks/tutorials/references/documents/people/organizations
  intervalMonthsGroupC: number; // glossary terms/explanations
  preferPolicyFile: boolean;
  queueSize: number;
  dueSoonDays: number;
  feedbackFile: string;
  /** Show a concept's trust tier inline on its frontmatter while editing (raw
   *  frontmatter / Source mode). Off leaves the editor untouched. */
  trustMarker: boolean;
  /** Offer LOKF-aware value completions while editing a concept's frontmatter
   *  (the actor string, status, and dates a curator hand-types). */
  autocomplete: boolean;
  /** The classes a concept's `type` may name without the report counting it
   *  as outside the vocabulary, and that `policies/knowledge-curation.md` may
   *  set an interval for. Defaults to the pinned schema's classes; a bundle
   *  validated against a domain schema (`lokf validate --schema`) lists that
   *  schema's classes here too, since the schema itself sits outside the
   *  vault and cannot be read. The same list as KTL Registrar's *Known LOKF
   *  types*. */
  knownTypes: string[];
}

export const DEFAULT_SETTINGS: CuratorSettings = {
  curatorId: "",
  bundleRoots: [],
  treatVaultRootAsBundle: false,
  excludeFolders: [],
  intervalMonthsGroupA: 6,
  intervalMonthsGroupB: 12,
  intervalMonthsGroupC: 24,
  preferPolicyFile: true,
  queueSize: 5,
  dueSoonDays: 30,
  feedbackFile: "",
  trustMarker: true,
  autocomplete: true,
  knownTypes: KNOWN_LOKF_TYPES,
};

function arraysEqual(a: string[], b: readonly string[]): boolean {
  return a.length === b.length && a.every((v, i) => v === b[i]);
}

/**
 * The settings the plugin runs with, given whatever `loadData()` returned:
 * the defaults, overlaid with every saved value, and then one correction - a
 * `knownTypes` list still sitting at the *pre-schema* built-in default is
 * refreshed to the pinned schema manifest's, so an upgrade picks up `Role` and
 * any later core class, while a list the person actually edited is left
 * exactly as they left it (and so never gains a later core class on its own -
 * the README and the setting's own description say so).
 *
 * The same rule, in the same shape, as KTL Registrar's `mergeSavedSettings`.
 */
export function mergeSavedSettings(saved: Record<string, unknown> | null | undefined): CuratorSettings {
  const settings: CuratorSettings = { ...DEFAULT_SETTINGS };
  if (!saved) return settings;
  const out = settings as unknown as Record<string, unknown>;
  for (const key of Object.keys(DEFAULT_SETTINGS) as (keyof CuratorSettings)[]) {
    if (saved[key] !== undefined) out[key] = saved[key];
  }
  const savedTypes = saved["knownTypes"];
  if (Array.isArray(savedTypes) && arraysEqual(savedTypes as string[], HARDCODED_LOKF_TYPES)) {
    settings.knownTypes = KNOWN_LOKF_TYPES;
  }
  return settings;
}
