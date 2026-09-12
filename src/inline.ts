// inline.ts - a CodeMirror 6 marker showing a concept's trust tier on its
// frontmatter, so the review card's verdict is visible where the note is
// edited. This is the Curator's counterpart to the Enforcer's inline
// diagnostics: same editor layer, but a trust badge rather than an underline.
//
// The tier vocabulary (trust-label.ts) stays import-free and Node-tested; this
// file is the thin editor adapter. It marks only raw frontmatter (Source mode);
// in Live Preview the frontmatter is Obsidian's Properties widget, which this
// does not hook.
import { TFile, editorInfoField } from "obsidian";
import { Decoration, type DecorationSet, EditorView, ViewPlugin, WidgetType, type ViewUpdate } from "@codemirror/view";
import type { TrustLabel } from "./trust-label";

/** The narrow slice of the plugin the editor extension needs. */
export interface TrustMarkerHost {
  trustMarkerEnabled(): boolean;
  /** The trust tier and handoff hint for the note in this editor, derived from
   *  its current text, or null when it is not a concept in a configured bundle
   *  (nothing to mark). */
  trustMarkerFor(file: TFile, doc: string): { label: TrustLabel; handoff: string | null } | null;
}

class TrustMarkerWidget extends WidgetType {
  constructor(
    private readonly label: TrustLabel,
    private readonly handoff: string | null
  ) {
    super();
  }

  eq(other: TrustMarkerWidget): boolean {
    return other.label.tone === this.label.tone && other.label.short === this.label.short && other.handoff === this.handoff;
  }

  toDOM(): HTMLElement {
    const el = createSpan({ cls: `lokf-trust-marker lokf-trust-${this.label.tone}`, text: this.label.short });
    const tip = this.handoff ? `${this.label.long} · ${this.handoff}` : this.label.long;
    el.setAttribute("aria-label", tip);
    el.setAttribute("title", tip);
    return el;
  }

  ignoreEvent(): boolean {
    return true;
  }
}

export function lokfTrustMarkerExtension(host: TrustMarkerHost) {
  return ViewPlugin.fromClass(
    class {
      decorations: DecorationSet;

      constructor(view: EditorView) {
        this.decorations = this.compute(view);
      }

      update(update: ViewUpdate) {
        // The marker depends only on the document and which file it is, so a
        // plain cursor move doesn't rebuild it - just an edit or switching the
        // note shown in this editor.
        const before = update.startState.field(editorInfoField, false)?.file ?? null;
        const after = update.state.field(editorInfoField, false)?.file ?? null;
        if (update.docChanged || before !== after) this.decorations = this.compute(update.view);
      }

      private compute(view: EditorView): DecorationSet {
        if (!host.trustMarkerEnabled()) return Decoration.none;
        const file = view.state.field(editorInfoField, false)?.file ?? null;
        if (!(file instanceof TFile)) return Decoration.none;
        const marker = host.trustMarkerFor(file, view.state.doc.toString());
        if (!marker) return Decoration.none;
        // A concept opens with `---` on the first line; the badge sits at the
        // end of that fence.
        const first = view.state.doc.line(1);
        if (first.text.trim() !== "---") return Decoration.none;
        const widget = Decoration.widget({ widget: new TrustMarkerWidget(marker.label, marker.handoff), side: 1 });
        return Decoration.set([widget.range(first.to)]);
      }
    },
    { decorations: (plugin) => plugin.decorations }
  );
}
