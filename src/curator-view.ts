// curator-view.ts - the "Curate" side panel: the read-only trust report
// (§5.3) and the one-concept-at-a-time review card (§6).
import { ItemView, TFile, type WorkspaceLeaf } from "obsidian";
import type LokfCuratorPlugin from "./main";
import type { TrustRecord } from "./trust";
import { handoffLabel } from "./trust-label";

export const LOKF_CURATOR_VIEW_TYPE = "lokf-curator-view";

function labelFor(record: TrustRecord): string {
  const bits: string[] = [];
  if (record.status === "deprecated") bits.push("retired");
  else {
    if (record.humanConfirmed) bits.push("confirmed by a person");
    else if (record.automationOnly) bits.push("checked by automation only");
    else if (record.unchecked) bits.push("nobody has checked this yet");
    if (record.status === "draft") bits.push("draft");
    if (record.pastReview) bits.push("past its review date");
    else if (record.dueSoon) bits.push("due soon");
    if (record.editedSinceConfirmed) bits.push("edited since confirmed");
    if (record.hasOpenQuestions) bits.push("has open questions");
  }
  if (record.cls === "unknown") bits.push("doesn't fit the vocabulary");
  return bits.join(" · ") || "no label yet";
}

function whyInQueue(record: TrustRecord): string {
  if (record.pastReview) return "past its review date";
  if (record.editedSinceConfirmed) return "edited since a person last confirmed it";
  if (record.status === "draft" && record.hasOpenQuestions) return "a draft with open questions";
  if (record.unchecked) return "nobody has checked it";
  return "a draft checked by automation only";
}

interface ReviewState {
  path: string;
  root: string;
}

export class LokfCuratorView extends ItemView {
  plugin: LokfCuratorPlugin;
  private reviewing: ReviewState | null = null;
  private bundleSelectorRoot: string | null = null;
  private openQuestionsCollapsed = false;

  constructor(leaf: WorkspaceLeaf, plugin: LokfCuratorPlugin) {
    super(leaf);
    this.plugin = plugin;
  }

  getViewType() {
    return LOKF_CURATOR_VIEW_TYPE;
  }
  getDisplayText() {
    return "Curate";
  }
  getIcon() {
    return "gem";
  }

  async onOpen() {
    this.render();
  }

  onReportsUpdated() {
    this.render();
  }

  private openFile(path: string) {
    const file = this.app.vault.getAbstractFileByPath(path);
    if (file instanceof TFile) void this.app.workspace.getLeaf(false).openFile(file);
  }

  private render() {
    const c = this.contentEl;
    c.empty();
    c.addClass("lokf-curator");
    if (this.reviewing) this.renderReviewCard(c, this.reviewing);
    else this.renderReport(c);
  }

  // ---- Step 1: report ----

  private renderReport(c: HTMLElement) {
    const reports = this.plugin.getReports();
    if (reports.length === 0) {
      c.createDiv({
        cls: "lokf-empty",
        text: this.plugin.hasNoBundle()
          ? "This vault has no knowledge bundle: no knowledge_bundle folder with an index.md, and no LOKF header on the root index.md. Your notes are left alone. LOKF Registrar's Insert the bundle's semantic header command, or the lokf-sidecar skill, creates a bundle; if the whole vault really is one, turn on Settings → Scope → Treat the vault root as the bundle."
          : "Nothing has been scanned yet.",
      });
      return;
    }

    let report = reports.find((r) => r.root === this.bundleSelectorRoot) ?? reports[0]!;
    if (reports.length > 1) {
      const selector = c.createDiv({ cls: "lokf-bundle-selector" });
      selector.createEl("label", { text: "Bundle: " });
      const select = selector.createEl("select");
      for (const r of reports) {
        const opt = select.createEl("option", { text: r.title, value: r.root });
        if (r.root === report.root) opt.selected = true;
      }
      select.addEventListener("change", () => {
        this.bundleSelectorRoot = select.value;
        this.render();
      });
    }

    c.createEl("h3", { text: report.title });

    if (report.ioIssues.length) {
      const box = c.createDiv({ cls: "lokf-io-issues" });
      for (const issue of report.ioIssues) box.createDiv({ cls: "lokf-io-issue", text: issue });
    }

    // Health chips - "a of N" visually dominant, the one number meant to rise.
    const health = c.createDiv({ cls: "lokf-health" });
    health.createDiv({
      cls: "lokf-chip lokf-chip-primary",
      text: `Confirmed by a person: ${report.health.humanConfirmed} of ${report.health.total}`,
    });
    const rest = health.createDiv({ cls: "lokf-health-rest" });
    rest.createSpan({ cls: "lokf-chip", text: `Automation only: ${report.health.automationOnly}` });
    rest.createSpan({ cls: "lokf-chip", text: `Nobody checked: ${report.health.unchecked}` });
    rest.createSpan({ cls: "lokf-chip", text: `Drafts: ${report.health.drafts}` });
    rest.createSpan({ cls: "lokf-chip", text: `Past review: ${report.health.pastReview}` });
    rest.createSpan({ cls: "lokf-chip", text: `Edited since confirmed: ${report.health.editedSinceConfirmed}` });
    rest.createSpan({ cls: "lokf-chip", text: `Retired: ${report.health.retired}` });

    // Active note, pinned.
    const activeInfo = this.plugin.getReportForActiveNote();
    if (activeInfo && activeInfo.report.root === report.root && activeInfo.record) {
      const box = c.createDiv({ cls: "lokf-active-note" });
      box.createEl("h4", { text: "Active note" });
      box.createDiv({ text: `${activeInfo.record.title} - ${labelFor(activeInfo.record)}` });
      const btn = box.createEl("button", { text: "Review this note" });
      btn.addEventListener("click", () => this.startReview(activeInfo.record!.path, report.root));
    }

    // Queue.
    c.createEl("h4", { text: "Worth ten minutes today" });
    if (report.queue.length === 0) {
      c.createDiv({ cls: "lokf-empty", text: "Nothing queued right now." });
    } else {
      const list = c.createDiv({ cls: "lokf-queue" });
      for (const record of report.queue) {
        const card = list.createDiv({ cls: "lokf-queue-card" });
        const titleEl = card.createDiv({ cls: "lokf-queue-title" });
        titleEl.createSpan({ text: `${record.title} ` });
        titleEl.createSpan({ cls: "lokf-queue-class", text: `(${record.type ?? "unknown"})` });
        titleEl.addEventListener("click", (evt) => {
          evt.stopPropagation();
          this.openFile(record.path);
        });
        card.createDiv({ cls: "lokf-queue-why", text: handoffLabel(record)?.text ?? whyInQueue(record) });
        card.createDiv({ cls: "lokf-queue-source", text: record.source ? record.source : "no source recorded" });
        card.setAttribute("role", "button");
        card.setAttribute("tabindex", "0");
        card.setAttribute("aria-label", `Review ${record.title}`);
        card.addEventListener("click", () => this.startReview(record.path, report.root));
        card.addEventListener("keydown", (evt) => {
          if (evt.key === "Enter" || evt.key === " ") {
            evt.preventDefault();
            this.startReview(record.path, report.root);
          }
        });
      }
      const goBtn = c.createEl("button", { cls: "lokf-go-button", text: "Go through these now" });
      goBtn.addEventListener("click", () => this.startReview(report.queue[0]!.path, report.root));
    }

    // Open questions the librarian left - collapsible, since a bundle
    // mid-refresh can have a lot of them and the queue above matters more.
    const oqHeader = c.createEl("h4", { cls: "lokf-collapsible", text: "" });
    const caret = oqHeader.createSpan({ cls: "lokf-caret", text: this.openQuestionsCollapsed ? "▸" : "▾" });
    oqHeader.createSpan({ text: ` Open questions the librarian left (${report.openQuestions.length})` });
    oqHeader.addEventListener("click", () => {
      this.openQuestionsCollapsed = !this.openQuestionsCollapsed;
      this.render();
    });
    void caret;
    if (!this.openQuestionsCollapsed) {
      if (report.openQuestions.length === 0) {
        c.createDiv({ cls: "lokf-empty", text: "None." });
      } else {
        const oqList = c.createDiv({ cls: "lokf-open-questions" });
        for (const oq of report.openQuestions) {
          const row = oqList.createDiv({ cls: "lokf-oq-row" });
          row.createSpan({ cls: "lokf-oq-title", text: `${oq.title}: ` });
          row.createSpan({ text: oq.text });
          row.addEventListener("click", () => this.openFile(oq.path));
        }
      }
    }

    // Feedback - never "none" when the file simply can't be seen (§10).
    c.createDiv({
      cls: "lokf-feedback",
      text:
        report.feedbackCount === null
          ? "Feedback file not reachable from this vault."
          : report.feedbackCount === 0
            ? "Feedback from readers: none."
            : `Feedback from readers: ${report.feedbackCount} ${report.feedbackCount === 1 ? "entry" : "entries"} waiting.`,
    });

    // Vocabulary fit.
    const vocab = c.createDiv({ cls: "lokf-vocab" });
    if (report.vocabularyIssues.length === 0) {
      vocab.setText("Vocabulary fit: fine.");
    } else {
      const types = [...new Set(report.vocabularyIssues.map((v) => v.message))].join("; ");
      vocab.setText(
        `Vocabulary fit: ${report.vocabularyIssues.length} concept(s) don't fit the known vocabulary (${types}). A domain schema's classes belong under Settings → Type vocabulary.`
      );
    }

    // What is still waiting behind the queue - not "every note not shown".
    c.createDiv({
      cls: "lokf-remaining",
      text: `${report.queueRemaining} more not yet checked. Run again anytime - every confirmation counts.`,
    });
  }

  private startReview(path: string, root: string) {
    this.reviewing = { path, root };
    const file = this.app.vault.getAbstractFileByPath(path);
    if (file instanceof TFile) this.plugin.recordCardOpened(file);
    this.render();
  }

  /** The command/hotkey entry into the review card, mirroring a queue-card
   *  click - so "Review next in queue" and "Review this note" go through the
   *  same flow (and its "look before you confirm" guard) as the panel. */
  reviewConcept(path: string, root: string): void {
    this.startReview(path, root);
  }

  private stopReview() {
    this.reviewing = null;
    this.render();
  }

  // ---- Step 2: review card ----

  private renderReviewCard(c: HTMLElement, state: ReviewState) {
    const file = this.app.vault.getAbstractFileByPath(state.path);
    if (!(file instanceof TFile)) {
      c.createDiv({ cls: "lokf-empty", text: "This note no longer exists." });
      const back = c.createEl("button", { text: "Back to report" });
      back.addEventListener("click", () => this.stopReview());
      return;
    }
    const cache = this.app.metadataCache.getFileCache(file);
    const fm = cache?.frontmatter ?? {};

    const toolbar = c.createDiv({ cls: "lokf-toolbar" });
    const back = toolbar.createEl("button", { text: "Back to report" });
    back.addEventListener("click", () => this.stopReview());

    // Looked up across every bundle's records, not just the top-`queueSize`
    // queue: the active note, or anything reached by "Review this note", is
    // very often not queued at all.
    const record = this.plugin.getRecord(state.path);
    if (!record) {
      c.createDiv({
        cls: "lokf-empty",
        text: "This note isn't a concept in a configured bundle, so there is nothing to record against it.",
      });
      return;
    }

    c.createEl("h3", { text: `${record.title} (${record.type ?? "unknown"})` });

    // 1. Source - every recorded one: `resource`, then each `sources[].resource`.
    c.createEl("h4", { text: "Source" });
    if (record.sources.length === 0) {
      c.createDiv({ cls: "lokf-empty", text: "No source recorded." });
    } else {
      for (const source of record.sources) {
        const resolution = this.plugin.resolveSource(source, state.root);
        const sourceBox = c.createDiv({ cls: "lokf-source" });
        sourceBox.createDiv({ cls: "lokf-source-path", text: resolution.displayPath });
        if (resolution.hint) {
          sourceBox.createDiv({ cls: "lokf-source-hint", text: `Opens the whole file - go to ${resolution.hint} yourself.` });
        }
        if (resolution.kind === "vault") {
          const openBtn = sourceBox.createEl("button", { text: "Open source" });
          openBtn.addEventListener("click", () => void this.plugin.openSourceSplit(resolution));
        } else {
          sourceBox.createDiv({ text: "This source is outside the vault - open it in your editor." });
          const copyBtn = sourceBox.createEl("button", { text: "Copy path" });
          copyBtn.addEventListener("click", () => void navigator.clipboard.writeText(resolution.displayPath));
        }
      }
    }

    // 2. Claim - the facts a source would contradict.
    c.createEl("h4", { text: "Claim" });
    const claim = c.createDiv({ cls: "lokf-claim" });
    const describeScalar = (v: unknown): string | null =>
      typeof v === "string" || typeof v === "number" || typeof v === "boolean" ? String(v) : null;
    const description = describeScalar(fm["description"]);
    if (description) claim.createDiv({ text: description });
    for (const key of ["endpoint", "http_method", "unit", "formula", "measures", "definition", "abbreviation"]) {
      const scalar = describeScalar(fm[key]);
      if (scalar !== null) claim.createDiv({ text: `${key}: ${scalar}` });
    }
    // Table/Dataset carry structured lists rather than scalars - a count is the
    // honest summary; the note itself has the detail.
    for (const key of ["fields", "distribution"]) {
      const value: unknown = fm[key];
      if (Array.isArray(value)) {
        const count = (value as unknown[]).length;
        claim.createDiv({ text: `${key}: ${count} entr${count === 1 ? "y" : "ies"}` });
      }
    }

    // 3. Current trust.
    c.createEl("h4", { text: "Current trust" });
    const trustBox = c.createDiv({ cls: "lokf-trust" });
    trustBox.createDiv({ text: labelFor(record) });
    trustBox.createDiv({ text: `${record.reliedOnBy} other concept(s) rely on this.` });

    // 4. The question.
    c.createEl("h4", { cls: "lokf-question", text: "Does the source still say this?" });

    this.renderVerbs(c, file, record, state.root);
  }

  private renderVerbs(c: HTMLElement, file: TFile, record: TrustRecord, root: string) {
    const verbBar = c.createDiv({ cls: "lokf-verbs" });
    // One dialog host, emptied before each use, so pressing two verbs in a row
    // replaces the prompt instead of stacking a second one under it.
    const dialog = c.createDiv({ cls: "lokf-dialog-host" });

    const sendBackBtn = verbBar.createEl("button", { text: "Wrong - send back", cls: "lokf-verb lokf-verb-default" });
    const confirmBtn = verbBar.createEl("button", { text: "Confirm", cls: "lokf-verb" });
    const correctedBtn = verbBar.createEl("button", { text: "Wrong - I corrected it", cls: "lokf-verb" });
    const retireBtn = verbBar.createEl("button", { text: "Retire", cls: "lokf-verb" });
    const laterBtn = verbBar.createEl("button", { text: "Later", cls: "lokf-verb" });

    // The skill's default verb, so a person who just presses Enter sends back
    // rather than confirming something they haven't checked.
    sendBackBtn.focus();

    confirmBtn.addEventListener("click", () => void this.promptConfirm(dialog, file, record, root));
    sendBackBtn.addEventListener("click", () => this.promptSendBack(dialog, file, record, root));
    correctedBtn.addEventListener("click", () => this.promptCorrected(dialog, file, record, root));
    retireBtn.addEventListener("click", () => this.promptRetire(dialog, file, record, root));
    laterBtn.addEventListener("click", () => this.promptLater(dialog, file, root));

    if (!this.plugin.hasReviewedCard(file)) {
      correctedBtn.disabled = true;
      correctedBtn.setAttribute("aria-label", "Open and read this concept first, then correct it in the editor.");
    }
  }

  private async promptConfirm(dialog: HTMLElement, file: TFile, record: TrustRecord, root: string) {
    const staleAfter = await this.plugin.proposeStaleAfterFor(record, root, new Date().toISOString().slice(0, 10));
    dialog.empty();
    const box = dialog.createDiv({ cls: "lokf-confirm-dialog" });
    box.createDiv({ text: `Next review proposed for ${staleAfter} - edit it if that's wrong.` });
    const input = box.createEl("input", { type: "date", value: staleAfter });

    // Never assume the open questions are answered: the section survives
    // unless the person says so.
    let openQuestionsAnswered = false;
    if (record.hasOpenQuestions) {
      box.createDiv({ text: "This concept has open questions. Are they answered?" });
      const choices = box.createDiv({ cls: "lokf-choice-row" });
      const yes = choices.createEl("button", { text: "Yes - remove them" });
      const no = choices.createEl("button", { text: "No - leave them", cls: "lokf-choice-selected" });
      const select = (answered: boolean) => {
        openQuestionsAnswered = answered;
        yes.toggleClass("lokf-choice-selected", answered);
        no.toggleClass("lokf-choice-selected", !answered);
      };
      yes.addEventListener("click", () => select(true));
      no.addEventListener("click", () => select(false));
    }

    const go = box.createEl("button", { text: "Confirm", cls: "mod-cta" });
    go.addEventListener("click", () => {
      go.disabled = true;
      void this.plugin.confirm(file, record, root, input.value || staleAfter, openQuestionsAnswered).then(() => this.stopReview());
    });
  }

  private promptSendBack(dialog: HTMLElement, file: TFile, record: TrustRecord, root: string) {
    dialog.empty();
    const box = dialog.createDiv({ cls: "lokf-note-dialog" });
    box.createDiv({ text: "What did the source actually say? (plain prose, required)" });
    const textarea = box.createEl("textarea");
    const go = box.createEl("button", { text: "Send back", cls: "mod-cta" });
    const error = box.createDiv({ cls: "lokf-dialog-error" });
    error.hide();
    textarea.focus();
    go.addEventListener("click", () => {
      const note = textarea.value.trim();
      if (!note) {
        error.setText("A note is required - the librarian needs to know what to re-derive.");
        error.show();
        return;
      }
      go.disabled = true;
      void this.plugin.sendBack(file, record, root, note).then(() => this.stopReview());
    });
  }

  /** §6.3's second guard on "corrected": the verb is only enabled once the
   *  card has been open, and if the file is unchanged since then it asks
   *  rather than silently recording a correction that was never made. */
  private promptCorrected(dialog: HTMLElement, file: TFile, record: TrustRecord, root: string) {
    const run = () => void this.plugin.corrected(file, record, root).then(() => this.stopReview());
    if (this.plugin.hasChangedSinceCardOpened(file)) {
      run();
      return;
    }
    dialog.empty();
    const box = dialog.createDiv({ cls: "lokf-note-dialog" });
    box.createDiv({ text: "The note hasn't changed - did you mean Confirm?" });
    const row = box.createDiv({ cls: "lokf-choice-row" });
    const confirmInstead = row.createEl("button", { text: "Confirm instead", cls: "mod-cta" });
    const anyway = row.createEl("button", { text: "Record the correction anyway" });
    confirmInstead.addEventListener("click", () => void this.promptConfirm(dialog, file, record, root));
    anyway.addEventListener("click", run);
  }

  private promptRetire(dialog: HTMLElement, file: TFile, record: TrustRecord, root: string) {
    dialog.empty();
    const box = dialog.createDiv({ cls: "lokf-note-dialog" });
    box.createDiv({ text: "Why is it retired? (e.g. “replaced by the Orders API”, required)" });
    const input = box.createEl("input", { type: "text" });
    const go = box.createEl("button", { text: "Retire", cls: "mod-cta" });
    const error = box.createDiv({ cls: "lokf-dialog-error" });
    error.hide();
    input.focus();
    go.addEventListener("click", () => {
      const reason = input.value.trim();
      if (!reason) {
        error.setText("A one-line reason is required - it goes in the bundle's log.");
        error.show();
        return;
      }
      go.disabled = true;
      void this.plugin.retire(file, record, root, reason).then(() => this.stopReview());
    });
  }

  private promptLater(dialog: HTMLElement, file: TFile, root: string) {
    dialog.empty();
    const box = dialog.createDiv({ cls: "lokf-note-dialog" });
    box.createDiv({ text: "Come back to it on (optional):" });
    const input = box.createEl("input", { type: "date" });
    const go = box.createEl("button", { text: "Later", cls: "mod-cta" });
    go.addEventListener("click", () => {
      go.disabled = true;
      void this.plugin.later(file, root, input.value || undefined).then(() => this.stopReview());
    });
  }
}
