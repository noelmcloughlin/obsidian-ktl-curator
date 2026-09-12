// suggest-context.ts - pure frontmatter-completion context detection (D).
//
// Import-free (no Obsidian), like trust.ts / trust-label.ts, so the fiddly
// YAML-context logic runs and is tested under plain Node (scripts/smoke-test.ts).
// suggest.ts is the Obsidian adapter that wraps these around an Editor.

export type SuggestKind = "status" | "actor" | "date";

export type LineReader = (i: number) => string;

export interface SuggestContext {
  kind: SuggestKind;
  query: string;
  startCh: number;
}

/** Which completion, if any, a frontmatter key's value takes: `status` the
 *  lifecycle values, `by` the curator's actor string, and `at`/`stale_after` a
 *  date. */
export function kindForKey(key: string): SuggestKind | null {
  if (key === "status") return "status";
  if (key === "by") return "actor";
  if (key === "at" || key === "stale_after") return "date";
  return null;
}

/** True when `line` sits inside the note's opening `---` … `---` frontmatter
 *  block (fences excluded). Raw-text editing only - in Live Preview the
 *  frontmatter is a Properties widget, not editable lines. */
export function withinFrontmatter(getLine: LineReader, lineCount: number, line: number): boolean {
  if (line <= 0 || getLine(0) !== "---") return false;
  for (let i = 1; i < lineCount; i++) {
    if (getLine(i) === "---") return line < i;
  }
  return false;
}

/** What the cursor is completing on its current line: the value of an inline
 *  `key: value`, optionally a `- key: value` list item (as under `verified`).
 *  Null when the position is not a completable value slot. */
export function detectSuggestContext(getLine: LineReader, line: number, ch: number): SuggestContext | null {
  const before = getLine(line).slice(0, ch);
  const inline = before.match(/^\s*(?:-\s+)?([A-Za-z_][\w-]*)\s*:\s*(.*)$/);
  if (!inline) return null;
  const kind = kindForKey(inline[1] ?? "");
  if (!kind) return null;
  const query = inline[2] ?? "";
  return { kind, query, startCh: ch - query.length };
}
