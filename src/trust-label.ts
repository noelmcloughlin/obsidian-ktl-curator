// trust-label.ts - the one shared vocabulary for a concept's trust tier, read
// off its TrustRecord (never stored). Both plugins render these exact phrases,
// so a reader sees the same words whichever surface shows them - the status
// bar, an inline gutter marker (A), or the review card. Import-free (only a
// type from trust.ts), so it stays Node-tested alongside the rest of the core.
import type { TrustRecord } from "./trust";

export type TrustTone = "confirmed" | "automation" | "unchecked" | "draft" | "retired";

export interface TrustLabel {
  tone: TrustTone;
  /** Terse form, for a status bar or a gutter marker. */
  short: string;
  /** Full sentence, for a tooltip or the review card. */
  long: string;
  /** A Lucide icon id for the tone. */
  icon: string;
}

/** A concept's trust tier as a label. A retired or draft status takes
 *  precedence over the check tier - a draft is work-in-progress whatever its
 *  verified events say, and a retired concept is out of the trust ladder - then
 *  the confirmed-by-a-human / automation-only / unchecked ladder. */
export function trustLabel(
  record: Pick<TrustRecord, "status" | "humanConfirmed" | "automationOnly">
): TrustLabel {
  if (record.status === "deprecated") {
    return { tone: "retired", short: "Retired", long: "Retired (deprecated)", icon: "archive" };
  }
  if (record.status === "draft") {
    return { tone: "draft", short: "Draft", long: "Draft - not yet curated", icon: "pencil" };
  }
  if (record.humanConfirmed) {
    return { tone: "confirmed", short: "Confirmed", long: "Confirmed by a person", icon: "check-circle" };
  }
  if (record.automationOnly) {
    return { tone: "automation", short: "Automation", long: "Checked by automation only", icon: "bot" };
  }
  return { tone: "unchecked", short: "Unchecked", long: "Nobody has checked this yet", icon: "help-circle" };
}

export type HandoffKind = "open-questions" | "edited-since" | "past-review" | "drafted" | "confirmed" | "unchecked";

export interface HandoffHint {
  kind: HandoffKind;
  text: string;
}

/** Where a concept sits in the librarian -> curator -> docent loop, as a single
 *  phrase computed from its record (never stored) - the "handoff" the two
 *  plugins share so a reader sees the same words whichever surfaces it. Ordered
 *  by what most wants a curator's attention; a retired concept has no handoff. */
export function handoffLabel(
  record: Pick<
    TrustRecord,
    | "status"
    | "hasOpenQuestions"
    | "editedSinceConfirmed"
    | "pastReview"
    | "generatedBy"
    | "humanConfirmed"
    | "confirmedBy"
    | "confirmedAt"
    | "unchecked"
  >
): HandoffHint | null {
  if (record.status === "deprecated") return null;
  if (record.hasOpenQuestions) return { kind: "open-questions", text: "Has open questions - for the curator" };
  if (record.editedSinceConfirmed === true) return { kind: "edited-since", text: "Edited since a person last confirmed it" };
  if (record.pastReview) return { kind: "past-review", text: "Past its review date" };
  if (record.status === "draft" && record.generatedBy === "process:lokf-librarian") {
    return { kind: "drafted", text: "Drafted by the librarian - awaiting a curator" };
  }
  if (record.humanConfirmed && record.confirmedBy) {
    const who = record.confirmedBy.replace(/^human:/, "");
    return { kind: "confirmed", text: record.confirmedAt ? `Confirmed by ${who} on ${record.confirmedAt}` : `Confirmed by ${who}` };
  }
  if (record.unchecked) return { kind: "unchecked", text: "Not yet checked - for the curator" };
  return null;
}
