// edits.ts - pure string/object transforms for every write the review
// session makes. Frontmatter transforms operate on the parsed object (the
// caller writes it back via processFrontMatter); body transforms operate on
// the raw markdown text (the caller writes it back via vault.process). No
// Obsidian, no Date.now() - `now`/`today` are parameters so every transform
// is reproducible under plain Node.

export interface VerifiedEvent {
  by: string;
  at: string; // ISO 8601 UTC, e.g. "2026-09-08T14:00:00Z"
}

/** Bare `verified: {by, at}` becomes a one-element list; a missing key
 *  becomes an empty list. Never mutates an existing event. */
export function normalizeVerified(raw: unknown): VerifiedEvent[] {
  const asEvent = (v: unknown): VerifiedEvent | null => {
    if (!v || typeof v !== "object" || Array.isArray(v)) return null;
    const obj = v as Record<string, unknown>;
    const by = obj["by"];
    const at = obj["at"];
    if (typeof by !== "string") return null;
    const atStr = typeof at === "string" ? at : at instanceof Date ? at.toISOString() : "";
    return { by, at: atStr };
  };
  if (raw === undefined) return [];
  if (Array.isArray(raw)) return raw.map(asEvent).filter((e): e is VerifiedEvent => e !== null);
  const single = asEvent(raw);
  return single ? [single] : [];
}

/** Confirm: append the person's verified event (existing events untouched,
 *  bare mapping normalized to a list first), delete `status` if it was
 *  `draft`. `stale_after` is set by the caller only after the date is
 *  accepted (a separate call to `applyStaleAfter`), per §6.3. */
export function applyConfirm(
  fm: Record<string, unknown>,
  curatorId: string,
  now: string
): Record<string, unknown> {
  const next = { ...fm };
  const events = normalizeVerified(fm["verified"]);
  events.push({ by: `human:${curatorId}`, at: now });
  next["verified"] = events;
  if (next["status"] === "draft") delete next["status"];
  return next;
}

export function applyStaleAfter(fm: Record<string, unknown>, staleAfter: string): Record<string, unknown> {
  return { ...fm, stale_after: staleAfter };
}

/** Wrong - send back: content untouched, `status: draft` set (added if
 *  absent). The body edit (append the Open questions bullet) is separate -
 *  see `appendOpenQuestion`. */
export function applySendBack(fm: Record<string, unknown>): Record<string, unknown> {
  return { ...fm, status: "draft" };
}

/** Wrong - I corrected it: `generated` is REPLACED (not appended, it records
 *  who produced the current content), a verified event is appended, and
 *  `status: draft` is removed. The frontmatter fact itself was already
 *  edited by the person in the editor - this only records the provenance. */
export function applyCorrected(
  fm: Record<string, unknown>,
  curatorId: string,
  now: string
): Record<string, unknown> {
  const next = { ...fm };
  next["generated"] = { by: `human:${curatorId}`, at: now };
  const events = normalizeVerified(fm["verified"]);
  events.push({ by: `human:${curatorId}`, at: now });
  next["verified"] = events;
  if (next["status"] === "draft") delete next["status"];
  return next;
}

/** Retire: `status: deprecated`. Nothing else changes. */
export function applyRetire(fm: Record<string, unknown>): Record<string, unknown> {
  return { ...fm, status: "deprecated" };
}

/** Later: keep/set `status: draft`; `stale_after` only if a date was typed. */
export function applyLater(fm: Record<string, unknown>, staleAfter?: string): Record<string, unknown> {
  const next: Record<string, unknown> = { ...fm, status: "draft" };
  if (staleAfter) next["stale_after"] = staleAfter;
  return next;
}

const OPEN_QUESTIONS_HEADING = "## Open questions";
const HEADING_LINE_RE = /^##\s+Open questions\s*$/;

/** Appends a dated, attributed bullet under `## Open questions`, creating the
 *  heading at the end of the body if it is absent. */
export function appendOpenQuestion(body: string, curatorId: string, dateOnly: string, note: string): string {
  const bullet = `- ${dateOnly}, human:${curatorId}: ${note}`;
  const lines = body.split("\n");
  const headingIdx = lines.findIndex((line) => HEADING_LINE_RE.test(line.trim()));
  if (headingIdx === -1) {
    const trimmed = body.replace(/\s+$/, "");
    const sep = trimmed.length ? "\n\n" : "";
    return `${trimmed}${sep}${OPEN_QUESTIONS_HEADING}\n\n${bullet}\n`;
  }
  // Insert after the heading's trailing blank line(s), i.e. before the next
  // heading of level <= 2 or end of file, appending after the last bullet.
  let insertAt = lines.length;
  for (let i = headingIdx + 1; i < lines.length; i++) {
    if (/^#{1,2}\s+/.test(lines[i] ?? "")) {
      insertAt = i;
      break;
    }
  }
  // Trim trailing blank lines within the section before appending, then
  // ensure exactly one blank line separates the new bullet block if the
  // section had no bullets yet.
  while (insertAt > headingIdx + 1 && (lines[insertAt - 1] ?? "").trim() === "") insertAt--;
  const before = lines.slice(0, insertAt);
  const after = lines.slice(insertAt);
  const sectionHadContent = insertAt > headingIdx + 1;
  const inserted = sectionHadContent ? [bullet] : ["", bullet];
  const needsTrailingBlank = after.length > 0 && (after[0] ?? "").trim() !== "";
  return [...before, ...inserted, ...(needsTrailingBlank ? [""] : []), ...after].join("\n");
}

/** Deletes the entire `## Open questions` section (heading through the line
 *  before the next heading of level <= 2, or end of file). */
export function deleteOpenQuestionsSection(body: string): string {
  const lines = body.split("\n");
  const headingIdx = lines.findIndex((line) => HEADING_LINE_RE.test(line.trim()));
  if (headingIdx === -1) return body;
  let endIdx = lines.length;
  for (let i = headingIdx + 1; i < lines.length; i++) {
    if (/^#{1,2}\s+/.test(lines[i] ?? "")) {
      endIdx = i;
      break;
    }
  }
  const before = lines.slice(0, headingIdx);
  const after = lines.slice(endIdx);
  while (before.length > 0 && (before.at(-1) ?? "").trim() === "") before.pop();
  // One blank line between what was above the section and what was below it:
  // two would leave the concept failing markdownlint's MD012 in a bundle that
  // lints, having been tidied by a verb the person pressed.
  return [...before, ...(before.length && after.length ? [""] : []), ...after].join("\n");
}

const DAY_HEADING_RE = /^## (\d{4}-\d{2}-\d{2})\s*$/;
const CURATION_LINE_RE = (curatorId: string) => new RegExp(`^\\* \\*\\*Curation\\*\\*: human:${escapeRe(curatorId)} `);

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export interface CurationTally {
  confirmed: number;
  sentBack: number;
  corrected: number;
  retired: number;
  gapsRecorded?: number;
  repeatedSendBackNote?: string;
}

/** Reverses `renderCurationLine` for this plugin's own output, so a verb can
 *  read the day's running tally back out of log.md before incrementing it -
 *  the log is the source of truth, not in-memory session state, since a
 *  person may close the laptop between verbs. Null when the line isn't in
 *  the shape this plugin writes (hand-edited, or from another tool). */
export function parseCurationTally(line: string): CurationTally | null {
  const m = line.match(
    /^\* \*\*Curation\*\*: human:\S+ confirmed (\d+), sent back (\d+), corrected (\d+), retired (\d+)(?:, recorded (\d+) gaps?)?\.(?:\s+(-\s.*))?$/
  );
  if (!m) return null;
  const tally: CurationTally = {
    confirmed: parseInt(m[1]!, 10),
    sentBack: parseInt(m[2]!, 10),
    corrected: parseInt(m[3]!, 10),
    retired: parseInt(m[4]!, 10),
  };
  if (m[5]) tally.gapsRecorded = parseInt(m[5], 10);
  return tally;
}

/**
 * This curator's running tally for `today`, read back out of `log.md` - the
 * log is the source of truth across a session boundary, since a person may
 * press one verb and close the laptop.
 *
 * Bounded to today's own `## YYYY-MM-DD` section: without that, a curator
 * whose first verb of the day follows an earlier day's Curation line would
 * resume from *that* day's counts.
 */
export function readCurationTally(log: string, today: string, curatorId: string): CurationTally {
  const empty: CurationTally = { confirmed: 0, sentBack: 0, corrected: 0, retired: 0 };
  const lines = log.split("\n");
  const headingIdx = lines.findIndex((l) => {
    const m = l.match(DAY_HEADING_RE);
    return m && m[1] === today;
  });
  if (headingIdx === -1) return empty;
  const curationRe = CURATION_LINE_RE(curatorId);
  for (let i = headingIdx + 1; i < lines.length; i++) {
    if (/^##\s+/.test(lines[i] ?? "")) break;
    if (curationRe.test(lines[i] ?? "")) return parseCurationTally(lines[i] ?? "") ?? empty;
  }
  return empty;
}

function renderCurationLine(curatorId: string, tally: CurationTally): string {
  const parts = [
    `confirmed ${tally.confirmed}`,
    `sent back ${tally.sentBack}`,
    `corrected ${tally.corrected}`,
    `retired ${tally.retired}`,
  ];
  if (tally.gapsRecorded) parts.push(`recorded ${tally.gapsRecorded} gap${tally.gapsRecorded === 1 ? "" : "s"}`);
  let line = `* **Curation**: human:${curatorId} ${parts.join(", ")}.`;
  if (tally.repeatedSendBackNote) line += ` ${tally.repeatedSendBackNote}`;
  return line;
}

/** Upserts today's `## YYYY-MM-DD` heading at the top of log.md and this
 *  curator's single `**Curation**` line under it (§6.5). A second curator's
 *  line the same day is untouched; other days' headings are untouched and
 *  stay below (this heading is prepended if new - newest first). */
export function upsertCurationLine(log: string, today: string, curatorId: string, tally: CurationTally): string {
  const lines = log.split("\n");
  const headingIdx = lines.findIndex((l) => {
    const m = l.match(DAY_HEADING_RE);
    return m && m[1] === today;
  });
  const curationRe = CURATION_LINE_RE(curatorId);
  const newLine = renderCurationLine(curatorId, tally);

  if (headingIdx === -1) {
    const block = [`## ${today}`, "", newLine, ""];
    if (lines.length === 1 && lines[0] === "") return block.join("\n").trimEnd() + "\n";
    // Newest first: insert before the first existing day heading that is
    // older than today, rather than always at the top - a log already
    // holding a later date must keep it above this one.
    const insertAt = lines.findIndex((l) => {
      const m = l.match(DAY_HEADING_RE);
      return m && m[1]! < today;
    });
    if (insertAt === -1) return [...lines, ...block].join("\n").trimEnd() + "\n";
    return [...lines.slice(0, insertAt), ...block, ...lines.slice(insertAt)].join("\n");
  }

  let sectionEnd = lines.length;
  for (let i = headingIdx + 1; i < lines.length; i++) {
    if (/^##\s+/.test(lines[i] ?? "")) {
      sectionEnd = i;
      break;
    }
  }
  const existingLineIdx = lines.findIndex((l, i) => i > headingIdx && i < sectionEnd && curationRe.test(l));
  if (existingLineIdx !== -1) {
    lines[existingLineIdx] = newLine;
    return lines.join("\n");
  }
  const before = lines.slice(0, headingIdx + 1);
  const section = lines.slice(headingIdx + 1, sectionEnd);
  while (section.length > 0 && (section[0] ?? "").trim() === "") section.shift();
  const after = lines.slice(sectionEnd);
  return [...before, "", newLine, ...section, ...after].join("\n");
}

/** Adds a `**Deprecation**` line immediately after the Curation line under
 *  today's heading (log already has today's heading by the time Retire is
 *  logged, since the Curation upsert runs first). */
export function appendDeprecationLine(log: string, today: string, title: string, path: string, reason: string): string {
  const lines = log.split("\n");
  const headingIdx = lines.findIndex((l) => {
    const m = l.match(DAY_HEADING_RE);
    return m && m[1] === today;
  });
  const depLine = `* **Deprecation**: [${title}](${path}) retired - ${reason}.`;
  if (headingIdx === -1) return [`## ${today}`, "", depLine, "", ...lines].join("\n");
  let insertAt = headingIdx + 1;
  for (let i = headingIdx + 1; i < lines.length; i++) {
    if ((lines[i] ?? "").trim() === "") continue;
    if (!/^##\s+/.test(lines[i] ?? "")) insertAt = i + 1;
    else break;
  }
  const before = lines.slice(0, insertAt);
  const after = lines.slice(insertAt);
  return [...before, depLine, ...after].join("\n");
}

/** The repeated-mistake hint: two send-backs the same day sharing the first
 *  four words of their note. */
export function repeatedSendBackHint(notes: string[]): string | null {
  const firstFour = (n: string) => n.trim().split(/\s+/).slice(0, 4).join(" ").toLowerCase();
  const counts = new Map<string, number>();
  for (const n of notes) {
    const key = firstFour(n);
    if (!key) continue;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  const repeats = [...counts.values()].filter((c) => c > 1);
  if (repeats.length === 0) return null;
  const total = repeats.reduce((a, b) => a + b, 0);
  return `- ${total} similar send-backs; check the librarian's instructions.`;
}

/** Renders the curation-policy concept template (review-session.md). */
export function renderCurationPolicyTemplate(baseIri: string, curatorId: string, now: string): string {
  return `---
type: Policy
id: ${baseIri}policies/knowledge-curation
title: Knowledge curation policy
description: How often each kind of concept in this bundle is re-confirmed by a person, and who does it.
generated:
  by: human:${curatorId}
  at: "${now}"
verified:
  - by: human:${curatorId}
    at: "${now}"
---

# Who curates

<team or people, plain names - link to Person/Organization concepts if they exist>

# How often a person re-confirms

| Kind of concept | Re-confirm every |
| --- | --- |
| Services, datasets, tables, metrics, attested computations | 6 months |
| Policies, playbooks, tutorials, references, documents, people, organizations | 12 months |
| Glossary terms, explanations | 24 months |

The ktl-curator skill proposes \`stale_after\` from this table when a person confirms a concept. Change the table, not the skill.

# What "confirmed" means here

A named person opened the concept's source and agreed the concept still says what the source says. Automation re-checking that a file still exists is recorded separately and is not confirmation.
`;
}

/** Renders a placeholder concept for something the person reports missing
 *  (review-session.md, "Recording something missing"). */
export function renderMissingPlaceholder(
  baseIri: string,
  type: string,
  slug: string,
  title: string,
  curatorId: string,
  now: string,
  dateOnly: string,
  hint: string
): string {
  return `---
type: ${type}
id: ${baseIri}${slug}
title: ${title}
description: Placeholder - not yet derived from the repository.
status: draft
generated:
  by: human:${curatorId}
  at: "${now}"
---

## Open questions

- ${dateOnly}, human:${curatorId}: reported missing. ${hint}
`;
}
