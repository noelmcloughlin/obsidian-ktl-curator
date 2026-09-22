// suggest.ts - LOKF-aware value completions while editing frontmatter (D).
//
// An EditorSuggest that fires only inside a concept's frontmatter and offers
// the values a curator hand-types: the actor string (`human:<curatorId>`), the
// lifecycle `status`, and dates (today, and today + each review interval for a
// `stale_after`). It never suggests key names, to sit cleanly beside Obsidian's
// own Properties autocomplete. The context detection lives in suggest-context.ts
// (pure, Node-tested); this file is the thin Obsidian adapter over an Editor.
import {
  App,
  EditorSuggest,
  TFile,
  type Editor,
  type EditorPosition,
  type EditorSuggestContext,
  type EditorSuggestTriggerInfo,
} from "obsidian";
import { detectSuggestContext, withinFrontmatter, type LineReader, type SuggestKind } from "./suggest-context";

/** The values a concept's frontmatter completes against, or null when the file
 *  is not a concept in a configured bundle. */
export interface SuggestVocabulary {
  statuses: string[];
  actors: string[];
  dates: string[];
}

export interface SuggestHost {
  suggestEnabled(): boolean;
  suggestVocabularyFor(file: TFile): SuggestVocabulary | null;
}

export interface CuratorSuggestion {
  value: string;
  detail?: string;
}

export class KtlCuratorSuggest extends EditorSuggest<CuratorSuggestion> {
  private host: SuggestHost;
  private kind: SuggestKind = "status";

  constructor(app: App, host: SuggestHost) {
    super(app);
    this.host = host;
  }

  onTrigger(cursor: EditorPosition, editor: Editor, file: TFile | null): EditorSuggestTriggerInfo | null {
    if (!file || !this.host.suggestEnabled()) return null;
    if (!this.host.suggestVocabularyFor(file)) return null;
    const getLine: LineReader = (i) => editor.getLine(i);
    if (!withinFrontmatter(getLine, editor.lineCount(), cursor.line)) return null;
    const ctx = detectSuggestContext(getLine, cursor.line, cursor.ch);
    if (!ctx) return null;
    this.kind = ctx.kind;
    return { start: { line: cursor.line, ch: ctx.startCh }, end: cursor, query: ctx.query };
  }

  getSuggestions(context: EditorSuggestContext): CuratorSuggestion[] {
    const file = context.file;
    if (!file) return [];
    const vocab = this.host.suggestVocabularyFor(file);
    if (!vocab) return [];
    let items: CuratorSuggestion[];
    switch (this.kind) {
      case "status":
        items = vocab.statuses.map((s) => ({ value: s }));
        break;
      case "actor":
        items = vocab.actors.map((a) => ({ value: a, detail: "you" }));
        break;
      case "date":
        items = vocab.dates.map((d, i) => ({ value: d, detail: i === 0 ? "today" : "review date" }));
        break;
    }
    const q = context.query.toLowerCase();
    return items.filter((i) => i.value.toLowerCase().includes(q)).slice(0, 20);
  }

  renderSuggestion(item: CuratorSuggestion, el: HTMLElement): void {
    el.createDiv({ text: item.value });
    if (item.detail) el.createEl("small", { cls: "ktl-suggest-meta", text: item.detail });
  }

  selectSuggestion(item: CuratorSuggestion): void {
    const ctx = this.context;
    if (!ctx) return;
    ctx.editor.replaceRange(item.value, ctx.start, ctx.end);
    ctx.editor.setCursor({ line: ctx.start.line, ch: ctx.start.ch + item.value.length });
    this.close();
  }
}
