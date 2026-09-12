// trust.ts - one concept's trust record, the bundle health counts, and the
// ranked "worth ten minutes today" queue. Pure: no Obsidian, no Date.now().
// Rules verbatim from lokf-curator's references/trust-fields.md - this file
// does not restate them, it implements them.
import { KNOWN_LOKF_TYPES, RELATION_FIELDS, classify, dirOf, normalizeTypeKey, resolveRelationTarget, toBundlePath } from "./bundle";

export type ConceptClass = "known" | "unknown";
export type ConceptStatus = "stable" | "draft" | "deprecated";

interface VerifiedEvent {
  by: string;
  at: string;
}

export interface TrustRecord {
  path: string; // vault path
  bundleRoot: string; // "" or the configured root it resolved to
  id: string; // frontmatter id, else minted by the caller
  title: string;
  type: string | null;
  cls: ConceptClass;
  invalidStatus: boolean; // status present and not draft|stable|deprecated
  status: ConceptStatus;
  humanConfirmed: boolean; // any verified[].by starts with "human:"
  automationOnly: boolean; // verified present, no human: actor
  unchecked: boolean; // no verified key at all
  /** The latest human verification's actor (raw, e.g. "human:alice") and date
   *  (YYYY-MM-DD), for the handoff hint "Confirmed by <id> on <date>". */
  confirmedBy: string | null;
  confirmedAt: string | null;
  /** The `generated.by` producer (e.g. "process:lokf-librarian"), for the
   *  "drafted by the librarian" handoff. */
  generatedBy: string | null;
  editedSinceConfirmed: boolean | null; // null = can't tell
  pastReview: boolean;
  dueSoon: boolean;
  hasOpenQuestions: boolean;
  firstOpenQuestion: string | null; // filled in lazily by the caller
  reliedOnBy: number; // filled in a second pass over all records
  generatedAt: string | null; // ISO, for "newest" tie-breaks
  source: string | null; // resource, else sources[0].resource, else null
  /** Every recorded source, in order: `resource` first, then each
   *  `sources[].resource` - the review card shows all of them (§6.2). */
  sources: string[];
}

export interface HealthCounts {
  total: number; // N, includes retired
  humanConfirmed: number; // a
  automationOnly: number; // b
  unchecked: number; // c
  drafts: number; // d
  pastReview: number; // e
  editedSinceConfirmed: number; // f
  retired: number; // g
}

export const DEFAULT_DUE_SOON_DAYS = 30;

/** Normalizes a YAML date/datetime value (string or Date, per trust-fields.md
 *  §Parsing notes: Obsidian's parseYaml and js-yaml both turn an unquoted
 *  date into a Date object) to YYYY-MM-DD for string comparison. */
export function normalizeDate(value: unknown): string | null {
  if (value instanceof Date) {
    if (isNaN(value.getTime())) return null;
    return value.toISOString().slice(0, 10);
  }
  if (typeof value === "string") {
    const m = value.match(/^\d{4}-\d{2}-\d{2}/);
    if (m) return m[0];
    const d = new Date(value);
    if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10);
    return null;
  }
  return null;
}

function addDays(isoDate: string, days: number): string {
  const d = new Date(isoDate + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Bare `verified` mapping (`verified: { by, at }`) is read as a one-element
 *  list, per trust-fields.md's parsing notes. */
function normalizeVerifiedList(raw: unknown): VerifiedEvent[] {
  const asEvent = (v: unknown): VerifiedEvent | null => {
    if (!v || typeof v !== "object" || Array.isArray(v)) return null;
    const obj = v as Record<string, unknown>;
    const by = typeof obj["by"] === "string" ? obj["by"] : null;
    const at = normalizeDateTime(obj["at"]);
    if (!by) return null;
    return { by, at: at ?? "" };
  };
  if (Array.isArray(raw)) return raw.map(asEvent).filter((e): e is VerifiedEvent => e !== null);
  const single = asEvent(raw);
  return single ? [single] : [];
}

function normalizeDateTime(value: unknown): string | null {
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "string") return value;
  return null;
}

function isValidStatus(s: string): s is ConceptStatus {
  return s === "stable" || s === "draft" || s === "deprecated";
}

export interface HeadingLine {
  level: number;
  heading: string;
}

/** True when an exact `## Open questions` heading is present - never a
 *  substring match against body prose (trust-fields.md's explicit warning). */
export function hasOpenQuestionsHeading(headings: HeadingLine[]): boolean {
  return headings.some((h) => h.level === 2 && h.heading === "Open questions");
}

export interface TrustInputs {
  path: string;
  bundleRoot: string;
  frontmatter: Record<string, unknown>;
  headings: HeadingLine[];
  mintId: (path: string) => string;
}

/** Builds one concept's trust record from its already-parsed frontmatter and
 *  heading list. `reliedOnBy` is left at 0 - it is filled by
 *  `computeReliedOnBy` in a second pass over every record, since it depends
 *  on the whole bundle. `firstOpenQuestion` is left null - the plugin reads
 *  it lazily only for concepts that have the heading (§5.2). */
export function buildTrustRecord(
  inputs: TrustInputs,
  today: string,
  dueSoonDays: number = DEFAULT_DUE_SOON_DAYS
): TrustRecord {
  const fm = inputs.frontmatter;

  const typeRaw = fm["type"];
  const type = typeof typeRaw === "string" && typeRaw.trim() ? typeRaw.trim() : null;

  const statusRaw = fm["status"];
  const statusStr = typeof statusRaw === "string" ? statusRaw.trim() : null;
  const invalidStatus = statusStr !== null && !isValidStatus(statusStr);
  const status: ConceptStatus = statusStr && isValidStatus(statusStr) ? statusStr : "stable";

  const hasVerifiedKey = "verified" in fm;
  const events = normalizeVerifiedList(fm["verified"]);
  const humanEvents = events.filter((e) => e.by.startsWith("human:"));
  const humanConfirmed = humanEvents.length > 0;
  const automationOnly = hasVerifiedKey && !humanConfirmed;
  const unchecked = !hasVerifiedKey;

  const generatedRaw = fm["generated"];
  let generatedAt: string | null = null;
  let generatedBy: string | null = null;
  if (generatedRaw && typeof generatedRaw === "object" && !Array.isArray(generatedRaw)) {
    generatedAt = normalizeDateTime((generatedRaw as Record<string, unknown>)["at"]);
    const by = (generatedRaw as Record<string, unknown>)["by"];
    generatedBy = typeof by === "string" ? by : null;
  }
  const timestampRaw = fm["timestamp"];
  if (!generatedAt && typeof timestampRaw === "string") generatedAt = timestampRaw;
  else if (!generatedAt && timestampRaw instanceof Date) generatedAt = normalizeDateTime(timestampRaw);

  let editedSinceConfirmed: boolean | null = null;
  if (generatedAt) {
    const latestHuman = humanEvents
      .map((e) => e.at)
      .filter(Boolean)
      .sort()
      .at(-1);
    if (latestHuman) {
      editedSinceConfirmed = generatedAt > latestHuman;
    }
  }

  const staleAfter = normalizeDate(fm["stale_after"]);
  let pastReview = false;
  let dueSoon = false;
  if (staleAfter) {
    pastReview = staleAfter <= today;
    dueSoon = !pastReview && staleAfter <= addDays(today, dueSoonDays);
  }

  const hasOpenQuestions = hasOpenQuestionsHeading(inputs.headings);

  // The latest human verification, for the "Confirmed by <id> on <date>" handoff.
  const latestHumanEvent = humanEvents.length
    ? ([...humanEvents].sort((a, b) => a.at.localeCompare(b.at)).at(-1) ?? null)
    : null;
  const confirmedBy = latestHumanEvent?.by ?? null;
  const confirmedAt = latestHumanEvent?.at ? normalizeDate(latestHumanEvent.at) : null;

  const titleRaw = fm["title"];
  const title = typeof titleRaw === "string" && titleRaw.trim() ? titleRaw.trim() : inputs.path;

  const allSources: string[] = [];
  const resourceRaw = fm["resource"];
  if (typeof resourceRaw === "string" && resourceRaw.trim()) allSources.push(resourceRaw.trim());
  const sourcesRaw: unknown = fm["sources"];
  if (Array.isArray(sourcesRaw)) {
    for (const entry of sourcesRaw as unknown[]) {
      if (entry && typeof entry === "object" && !Array.isArray(entry)) {
        const entryResource = (entry as Record<string, unknown>)["resource"];
        if (typeof entryResource === "string" && entryResource.trim()) allSources.push(entryResource.trim());
      }
    }
  }
  const source: string | null = allSources[0] ?? null;

  const idRaw = fm["id"];
  const id = typeof idRaw === "string" && idRaw ? idRaw : inputs.mintId(inputs.path);

  return {
    path: inputs.path,
    bundleRoot: inputs.bundleRoot,
    id,
    title,
    type,
    cls: classify(type),
    invalidStatus,
    status,
    humanConfirmed,
    automationOnly,
    unchecked,
    confirmedBy,
    confirmedAt,
    generatedBy,
    editedSinceConfirmed,
    pastReview,
    dueSoon,
    hasOpenQuestions,
    firstOpenQuestion: null,
    reliedOnBy: 0,
    generatedAt,
    source,
    sources: allSources,
  };
}

/** The relation targets one concept declares, as raw frontmatter values: the
 *  ten typed fields (scalar or list) plus each `relations[].target`. */
function relationTargetsOf(fm: Record<string, unknown>): unknown[] {
  const targets: unknown[] = [];
  for (const field of RELATION_FIELDS) {
    const v: unknown = fm[field];
    if (v === undefined) continue;
    if (Array.isArray(v)) targets.push(...(v as unknown[]));
    else targets.push(v);
  }
  const relations: unknown = fm["relations"];
  if (Array.isArray(relations)) {
    for (const entry of relations as unknown[]) {
      if (entry && typeof entry === "object" && !Array.isArray(entry)) {
        const target = (entry as Record<string, unknown>)["target"];
        if (target !== undefined) targets.push(target);
      }
    }
  }
  return targets;
}

/**
 * Fills in every record's `reliedOnBy` - "N other concepts rely on this".
 *
 * MUST be called once over the records of EVERY bundle at once, not once per
 * bundle: the id map is keyed by IRI, so a concept in bundle A pointing at
 * bundle B's IRI counts for B (§4). Mutates each record in place.
 *
 * A bare relative target is tried bundle-root-relative first, then relative
 * to the citing concept's own folder - an author may well have written a
 * sibling's filename. Only a candidate that names a real concept is counted,
 * so a stale or fabricated target inflates nobody's score.
 */
export function computeReliedOnBy(
  records: TrustRecord[],
  frontmatterByPath: Map<string, Record<string, unknown>>,
  baseIriByRoot: Map<string, string | null>
): void {
  const byId = new Map<string, TrustRecord>();
  for (const r of records) byId.set(r.id, r);
  for (const r of records) r.reliedOnBy = 0;

  for (const citing of records) {
    const fm = frontmatterByPath.get(citing.path);
    if (!fm) continue;
    const baseIri = baseIriByRoot.get(citing.bundleRoot) ?? null;
    const conceptDir = dirOf(toBundlePath(citing.path, citing.bundleRoot));

    for (const raw of relationTargetsOf(fm)) {
      const resolved = resolveRelationTarget(raw, baseIri);
      const candidates: string[] = [];
      if (resolved.kind === "internal-iri" && baseIri) {
        candidates.push(baseIri + resolved.resolvedPath);
      } else if (resolved.kind === "internal-relative" && baseIri) {
        const withoutExt = (resolved.resolvedPath ?? "").replace(/\.md$/i, "");
        candidates.push(baseIri + withoutExt);
        if (conceptDir) candidates.push(`${baseIri}${conceptDir}/${withoutExt}`);
      } else if (resolved.kind === "external-iri") {
        // Another bundle's minted IRI, or a genuinely external one - the map
        // decides which, since it holds every bundle's concepts.
        candidates.push(resolved.raw);
      }
      const hit = candidates.map((c) => byId.get(c)).find((r) => r !== undefined);
      // A concept naming itself is not "another concept relying on" it.
      if (hit && hit !== citing) hit.reliedOnBy += 1;
    }
  }
}

/** The seven health counts. Not a partition - only `total` is a total; every
 *  other count may overlap another (§trust-fields.md, "Labels overlap by
 *  design"). Retired concepts are excluded from every count but `total` and
 *  `retired` itself. */
export function computeHealth(records: TrustRecord[]): HealthCounts {
  const active = records.filter((r) => r.status !== "deprecated");
  return {
    total: records.length,
    humanConfirmed: active.filter((r) => r.humanConfirmed).length,
    automationOnly: active.filter((r) => r.automationOnly).length,
    unchecked: active.filter((r) => r.unchecked).length,
    drafts: active.filter((r) => r.status === "draft").length,
    pastReview: active.filter((r) => r.pastReview).length,
    editedSinceConfirmed: active.filter((r) => r.editedSinceConfirmed === true).length,
    retired: records.filter((r) => r.status === "deprecated").length,
  };
}

type QueueGroup = 1 | 2 | 3 | 4;

function queueGroup(r: TrustRecord): QueueGroup | null {
  if (r.pastReview || r.editedSinceConfirmed === true) return 1;
  if (r.status === "draft" && r.hasOpenQuestions) return 2;
  if (r.unchecked) return 3;
  if (r.status === "draft" || r.automationOnly) return 4;
  return null;
}

/**
 * Every concept that wants a person's attention, fully ranked per
 * trust-fields.md's §Ranking: group first, then most-relied-upon, then newest
 * `generated.at`. Retired concepts are excluded, as they are from every label.
 *
 * The full list (rather than just the top few) is what lets the report say how
 * many more are waiting behind the queue.
 */
export function rankQueueAll(records: TrustRecord[]): TrustRecord[] {
  const eligible = records
    .filter((r) => r.status !== "deprecated")
    .map((r) => ({ r, group: queueGroup(r) }))
    .filter((x): x is { r: TrustRecord; group: QueueGroup } => x.group !== null);

  eligible.sort((a, b) => {
    if (a.group !== b.group) return a.group - b.group;
    if (a.r.reliedOnBy !== b.r.reliedOnBy) return b.r.reliedOnBy - a.r.reliedOnBy;
    const at = a.r.generatedAt ?? "";
    const bt = b.r.generatedAt ?? "";
    return bt.localeCompare(at);
  });

  return eligible.map((x) => x.r);
}

/** Ranked "worth ten minutes today" queue, at most `limit` entries. */
export function rankQueue(records: TrustRecord[], limit: number): TrustRecord[] {
  return rankQueueAll(records).slice(0, limit);
}

/** The three default groups from the skill's curation-policy template
 *  (review-session.md), matched by normalized class name. */
export const DEFAULT_STALE_GROUPS: { classes: string[]; months: number }[] = [
  { classes: ["Service", "Dataset", "Table", "Metric", "AttestedComputation"], months: 6 },
  { classes: ["Policy", "Playbook", "Tutorial", "Reference", "Document", "Person", "Organization"], months: 12 },
  { classes: ["GlossaryTerm", "Explanation"], months: 24 },
];

/** Months to add to a confirmation date for a concept's class, from settings'
 *  fallback intervals or an already-parsed policy-table override (§6.4). */
export function monthsForClass(
  type: string | null,
  settingsIntervals: { classes: string[]; months: number }[],
  policyOverrides: Map<string, number>
): number {
  const key = type ? normalizeTypeKey(type) : "";
  if (policyOverrides.has(key)) return policyOverrides.get(key)!;
  for (const group of settingsIntervals) {
    if (group.classes.some((c) => normalizeTypeKey(c) === key)) return group.months;
  }
  return 12;
}

export function proposeStaleAfter(confirmationDate: string, months: number): string {
  const d = new Date(confirmationDate + "T00:00:00Z");
  d.setUTCMonth(d.getUTCMonth() + months);
  return d.toISOString().slice(0, 10);
}

/** Tolerant parse of `policies/knowledge-curation.md`'s markdown table, per
 *  §6.4: any row whose first cell mentions a class name and whose second
 *  cell matches "(\d+)\s*months" overrides that class; anything unparseable
 *  leaves the setting in force. Returns a map keyed by normalized class name. */
export function parseCurationPolicyTable(body: string): Map<string, number> {
  const overrides = new Map<string, number>();
  for (const line of body.split("\n")) {
    if (!line.trim().startsWith("|")) continue;
    const cells = line
      .split("|")
      .map((c) => c.trim())
      .filter((c, i, arr) => !(i === 0 && c === "") && !(i === arr.length - 1 && c === ""));
    if (cells.length < 2) continue;
    const monthsMatch = cells[1]?.match(/(\d+)\s*months/i);
    if (!monthsMatch) continue;
    const months = parseInt(monthsMatch[1] ?? "", 10);
    if (!Number.isFinite(months)) continue;
    const firstCell = cells[0] ?? "";
    for (const cls of KNOWN_LOKF_TYPES) {
      if (firstCell.toLowerCase().includes(cls.toLowerCase())) {
        overrides.set(normalizeTypeKey(cls), months);
      }
    }
  }
  return overrides;
}
