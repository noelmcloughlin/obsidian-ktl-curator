// main.ts - LOKF Curator plugin entry point.
import { App, Modal, Notice, Plugin, Setting, TFile, TFolder, type TAbstractFile, type WorkspaceLeaf, debounce, parseYaml } from "obsidian";
import {
  bundleLogPath,
  bundleRootIndexPath,
  hasUrlScheme,
  hiddenRootSegment,
  isExcluded,
  isReserved,
  mintExpectedId,
  normalizeBundleRoots,
  readBaseIri,
  resolveBundleRoot,
  splitFrontmatter,
  splitSourceLocator,
  toBundlePath,
  toVaultPath,
} from "./bundle";
import {
  computeHealth,
  computeReliedOnBy,
  buildTrustRecord,
  monthsForClass,
  parseCurationPolicyTable,
  proposeStaleAfter,
  rankQueueAll,
  type HeadingLine,
  type HealthCounts,
  type TrustRecord,
} from "./trust";
import {
  appendDeprecationLine,
  appendOpenQuestion,
  applyConfirm,
  applyCorrected,
  applyLater,
  applyRetire,
  applySendBack,
  applyStaleAfter,
  deleteOpenQuestionsSection,
  readCurationTally,
  renderCurationPolicyTemplate,
  renderMissingPlaceholder,
  repeatedSendBackHint,
  upsertCurationLine,
  type CurationTally,
} from "./edits";
import { LokfCuratorView, LOKF_CURATOR_VIEW_TYPE } from "./curator-view";
import { trustLabel, handoffLabel, type TrustLabel } from "./trust-label";
import { lokfTrustMarkerExtension } from "./inline";
import { LokfCuratorSuggest, type SuggestVocabulary } from "./suggest";
import { FieldReferenceModal } from "./field-modal";
import { LOKF_FIELD_DOCS } from "./fields";
import { LokfCuratorSettingTab } from "./settings";

export interface CuratorSettings {
  curatorId: string;
  bundleRoots: string[];
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
}

export const DEFAULT_SETTINGS: CuratorSettings = {
  curatorId: "",
  bundleRoots: [],
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
};

export interface OpenQuestionEntry {
  path: string;
  title: string;
  text: string;
}

export interface BundleReport {
  root: string;
  title: string;
  health: HealthCounts;
  queue: TrustRecord[];
  /** Concepts still wanting attention behind the queue's `queueSize` cap. */
  queueRemaining: number;
  openQuestions: OpenQuestionEntry[];
  vocabularyIssues: { path: string; message: string }[];
  scanned: number;
  ioIssues: string[]; // misconfigured-root findings (§5.1)
  /** null = the feedback file isn't reachable from this vault (§10). */
  feedbackCount: number | null;
}

export interface SourceResolution {
  kind: "vault" | "unreachable";
  vaultPath?: string;
  /** The source exactly as the concept records it, suffix included. */
  displayPath: string;
  /** A `#fragment` / `:line` suffix, shown as a hint but stripped for opening. */
  hint: string | null;
}

const SLUG_RE = /^[a-z0-9][a-z0-9-]*$/;

function nowIso(): string {
  return new Date().toISOString().replace(/\.\d+Z$/, "Z");
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

/** `iso` (YYYY-MM-DD) advanced by whole months, for the stale_after date
 *  completions - a UTC calendar shift, no time component. */
function addMonthsIso(iso: string, months: number): string {
  const d = new Date(iso + "T00:00:00Z");
  d.setUTCMonth(d.getUTCMonth() + months);
  return d.toISOString().slice(0, 10);
}

class CuratorIdModal extends Modal {
  private onSubmit: (id: string | null) => void;
  private value = "";

  constructor(app: App, onSubmit: (id: string | null) => void) {
    super(app);
    this.onSubmit = onSubmit;
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.createEl("h3", { text: "Record your answers as human:<id>?" });
    contentEl.createEl("p", {
      text: "Every verdict you record in this session is attributed to this id, written as the literal human:<id> - never an email, the bundle may be public.",
    });
    let errorEl: HTMLElement | null = null;
    new Setting(contentEl).setName("Curator ID").addText((text) => {
      text.setPlaceholder("ada-lovelace").onChange((v) => (this.value = v.trim()));
    });
    new Setting(contentEl).addButton((btn) =>
      btn
        .setButtonText("Confirm")
        .setCta()
        .onClick(() => {
          if (this.value.includes("@")) {
            errorEl?.remove();
            errorEl = contentEl.createEl("p", { text: "Never an email - the bundle may be public.", cls: "lokf-curator-error" });
            return;
          }
          if (!SLUG_RE.test(this.value)) {
            errorEl?.remove();
            errorEl = contentEl.createEl("p", { text: 'Use lowercase letters, digits, and hyphens, e.g. "ada-lovelace".', cls: "lokf-curator-error" });
            return;
          }
          this.onSubmit(this.value);
          this.close();
        })
    );
  }

  onClose() {
    this.contentEl.empty();
  }
}

export default class LokfCuratorPlugin extends Plugin {
  settings: CuratorSettings = { ...DEFAULT_SETTINGS };
  statusEl!: HTMLElement;

  private busy = false;
  private bundleRootsRaw: string[] | null = null;
  private bundleRootsResolved: string[] = [];
  private baseIriCache = new Map<string, string | null>();
  private reportsByRoot = new Map<string, BundleReport>();
  private recordsByRoot = new Map<string, TrustRecord[]>();
  /** file.stat.mtime at the moment the review card for this path was last
   *  opened - the guard for "the note hasn't changed, did you mean Confirm?" */
  private cardOpenedAt = new Map<string, number>();
  private cardOpenedOnce = new Set<string>();
  /** Today's send-back notes, for the repeated-mistake hint (§6.5). Keyed by
   *  date so the list empties itself at midnight rather than accumulating
   *  across days; it is in-memory only, so the hint covers this session's
   *  send-backs, which is when a repeated instruction is worth noticing. */
  private sendBackNotesByDate = new Map<string, string[]>();

  private get sendBackNotesToday(): string[] {
    return this.sendBackNotesByDate.get(todayIso()) ?? [];
  }

  private rememberSendBackNote(date: string, note: string): void {
    const notes = this.sendBackNotesByDate.get(date) ?? [];
    notes.push(note);
    this.sendBackNotesByDate.set(date, notes);
    for (const key of this.sendBackNotesByDate.keys()) {
      if (key !== date) this.sendBackNotesByDate.delete(key);
    }
  }

  private bundleRoots(): string[] {
    const raw = this.settings.bundleRoots;
    if (raw !== this.bundleRootsRaw) {
      this.bundleRootsRaw = raw;
      this.bundleRootsResolved = normalizeBundleRoots(raw);
    }
    return this.bundleRootsResolved;
  }

  private resolveRoot(vaultPath: string): string | null {
    return resolveBundleRoot(vaultPath, this.bundleRoots());
  }

  private isInBundle(vaultPath: string): boolean {
    return this.resolveRoot(vaultPath) !== null;
  }

  private candidateFiles(): TFile[] {
    const configDir = this.app.vault.configDir;
    return this.app.vault
      .getMarkdownFiles()
      .filter(
        (f) =>
          !f.path.startsWith(configDir + "/") &&
          !isExcluded(f.path, this.settings.excludeFolders) &&
          this.isInBundle(f.path) &&
          isReserved(toBundlePath(f.path, this.resolveRoot(f.path) ?? "")) === null
      );
  }

  private getCuratorView(): LokfCuratorView | null {
    const leaf = this.app.workspace.getLeavesOfType(LOKF_CURATOR_VIEW_TYPE).at(0);
    return leaf && leaf.view instanceof LokfCuratorView ? leaf.view : null;
  }

  async onload(): Promise<void> {
    await this.loadSettings();

    this.registerView(LOKF_CURATOR_VIEW_TYPE, (leaf) => new LokfCuratorView(leaf, this));

    this.statusEl = this.addStatusBarItem();
    this.statusEl.setText("Curate: —");
    this.statusEl.addClass("mod-clickable");
    this.statusEl.setAttribute("aria-label", "LOKF Curator - click to open");
    this.statusEl.onClickEvent(() => void this.activateView());

    this.addRibbonIcon("gem", "Curate", () => void this.activateView());

    this.addCommand({
      id: "open-curator",
      name: "Open curator panel",
      callback: () => void this.activateView(),
    });
    this.addCommand({
      id: "create-curation-policy",
      name: "Create curation policy",
      callback: () => void this.createCurationPolicy(),
    });
    this.addCommand({
      id: "record-something-missing",
      name: "Record something missing",
      callback: () => void this.recordSomethingMissing(),
    });
    this.addCommand({
      id: "review-next",
      name: "Review the next concept in the queue",
      callback: () => void this.reviewNext(),
    });
    this.addCommand({
      id: "review-active-note",
      name: "Review the active note",
      callback: () => void this.reviewActiveNote(),
    });
    this.addCommand({
      id: "field-reference",
      name: "Look up a LOKF field",
      callback: () => new FieldReferenceModal(this.app, LOKF_FIELD_DOCS).open(),
    });

    this.addSettingTab(new LokfCuratorSettingTab(this.app, this));

    // The trust tier shown inline on a concept's frontmatter while editing.
    this.registerEditorExtension(lokfTrustMarkerExtension(this));

    // LOKF-aware value completions inside a concept's frontmatter.
    this.registerEditorSuggest(new LokfCuratorSuggest(this.app, this));

    const refresh = debounce(() => void this.refreshAllReports(), 300, true);
    this.registerEvent(this.app.metadataCache.on("changed", (file) => {
      this.invalidateBaseIri(file.path);
      if (this.isInBundle(file.path)) refresh();
    }));
    this.registerEvent(this.app.vault.on("delete", (file: TAbstractFile) => {
      this.invalidateBaseIri(file.path);
      if (this.isInBundle(file.path)) refresh();
    }));
    this.registerEvent(this.app.vault.on("rename", (file: TAbstractFile, oldPath: string) => {
      this.invalidateBaseIri(file.path);
      this.invalidateBaseIri(oldPath);
      if (this.isInBundle(file.path) || this.isInBundle(oldPath)) refresh();
    }));
    this.registerEvent(this.app.workspace.on("active-leaf-change", () => this.refreshStatusBar()));

    this.app.workspace.onLayoutReady(() => void this.refreshAllReports());
  }

  async loadSettings(): Promise<void> {
    const saved = (await this.loadData()) as Record<string, unknown> | null;
    Object.assign(this.settings, DEFAULT_SETTINGS);
    if (!saved) return;
    for (const key of Object.keys(DEFAULT_SETTINGS) as (keyof CuratorSettings)[]) {
      if (saved[key] !== undefined) (this.settings as unknown as Record<string, unknown>)[key] = saved[key];
    }
  }

  async saveSettings(): Promise<void> {
    await this.saveData({ ...this.settings });
  }

  invalidateBundleCache(): void {
    this.baseIriCache.clear();
    void this.refreshAllReports();
  }

  // ---- Identity ----

  /** Resolves the curator id, prompting once via a modal if unset. Resolves
   *  to null if the person cancels. */
  private async ensureCuratorId(): Promise<string | null> {
    if (this.settings.curatorId) return this.settings.curatorId;
    return new Promise((resolve) => {
      new CuratorIdModal(this.app, (id) => {
        if (!id) {
          resolve(null);
          return;
        }
        this.settings.curatorId = id;
        void this.saveSettings().then(() => resolve(id));
      }).open();
    });
  }

  // ---- Scan / report computation ----

  private async findBaseIriFor(root: string): Promise<string | null> {
    if (this.baseIriCache.has(root)) return this.baseIriCache.get(root) ?? null;
    const rootIndex = this.app.vault.getAbstractFileByPath(bundleRootIndexPath(root));
    let baseIri: string | null = null;
    if (rootIndex instanceof TFile) {
      const cached = this.app.metadataCache.getFileCache(rootIndex)?.frontmatter;
      // The cache already holds parsed frontmatter for any indexed file, so
      // the read below only ever runs for one the cache hasn't reached yet.
      if (cached) baseIri = readBaseIri(cached);
      else {
        try {
          baseIri = readBaseIri((await this.readConcept(rootIndex)).fm);
        } catch {
          baseIri = null;
        }
      }
    }
    this.baseIriCache.set(root, baseIri);
    return baseIri;
  }

  /** Drops the cached `base_iri` for every bundle whose root `index.md` sits
   *  at or under `path`. Folder-aware, because renaming or deleting a bundle
   *  root fires for the folder, not for each file inside it - without this a
   *  changed `base_iri` would never be picked up and every concept's minted id
   *  (and so every reliance count) would stay stale for the session. */
  private invalidateBaseIri(path: string): void {
    const roots = new Set<string>(this.baseIriCache.keys());
    for (const r of this.bundleRoots()) roots.add(r);
    if (roots.size === 0) roots.add("");
    for (const root of roots) {
      const index = bundleRootIndexPath(root);
      if (index === path || index.startsWith(path + "/")) this.baseIriCache.delete(root);
    }
  }

  private async policyOverridesFor(root: string): Promise<Map<string, number>> {
    if (!this.settings.preferPolicyFile) return new Map();
    const path = toVaultPath("policies/knowledge-curation.md", root);
    const file = this.app.vault.getAbstractFileByPath(path);
    if (!(file instanceof TFile)) return new Map();
    try {
      const content = await this.app.vault.read(file);
      const { body } = splitFrontmatter(content);
      return parseCurationPolicyTable(body);
    } catch {
      return new Map();
    }
  }

  /** Runs `worker` over `items` in bounded batches, yielding to the event loop
   *  between them. Only the cache-miss fallback needs it (§5.1) - the cached
   *  scan itself is pure arithmetic over frontmatter already in memory - but a
   *  bundle whose files the metadata cache has not indexed yet would otherwise
   *  read hundreds of files in one synchronous burst. */
  private async processQueue<T>(items: T[], worker: (item: T) => Promise<void>): Promise<void> {
    const size = 50;
    for (let i = 0; i < items.length; i += size) {
      await Promise.all(items.slice(i, i + size).map((it) => worker(it).catch(() => undefined)));
      await new Promise((r) => window.setTimeout(r, 0));
    }
  }

  /**
   * Frontmatter and headings for one concept, from `metadataCache` alone -
   * the whole point of §5.1's zero-read scan. Returns null when the cache has
   * no entry for the file yet (freshly created, or not indexed), which the
   * caller fills in with a real read.
   */
  private cachedConcept(file: TFile): { fm: Record<string, unknown>; headings: HeadingLine[] } | null {
    const cache = this.app.metadataCache.getFileCache(file);
    if (!cache) return null;
    return {
      fm: cache.frontmatter ?? {},
      headings: (cache.headings ?? []).map((h) => ({ level: h.level, heading: h.heading })),
    };
  }

  /** The cache-miss fallback: read and parse the file the way the cache would
   *  have. Headings are matched the same way `trust.ts` requires - a line that
   *  *is* the heading, never a mention of one in prose. */
  private async readConcept(file: TFile): Promise<{ fm: Record<string, unknown>; headings: HeadingLine[] }> {
    const content = await this.app.vault.cachedRead(file);
    const { hasFm, raw, body } = splitFrontmatter(content);
    let fm: Record<string, unknown> = {};
    if (hasFm) {
      try {
        const parsed: unknown = parseYaml(raw);
        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) fm = parsed as Record<string, unknown>;
      } catch {
        fm = {};
      }
    }
    const headings: HeadingLine[] = [];
    for (const line of body.split("\n")) {
      const m = line.match(/^(#{1,6})\s+(.*\S)\s*$/);
      if (m) headings.push({ level: m[1]!.length, heading: m[2]! });
    }
    return { fm, headings };
  }

  async refreshAllReports(): Promise<void> {
    if (this.busy) return;
    this.busy = true;
    try {
      const files = this.candidateFiles();
      const roots = this.bundleRoots().length ? this.bundleRoots() : [""];
      const baseIriByRoot = new Map<string, string | null>();
      for (const root of roots) baseIriByRoot.set(root, await this.findBaseIriFor(root));

      const filesByRoot = new Map<string, TFile[]>();
      for (const f of files) {
        const r = this.resolveRoot(f.path) ?? "";
        if (!filesByRoot.has(r)) filesByRoot.set(r, []);
        filesByRoot.get(r)!.push(f);
      }

      // One pass over every bundle before any per-bundle report is built:
      // reliance counting is global, so a concept in bundle A pointing at
      // bundle B's IRI must be able to find B's record (§4).
      const today = todayIso();
      const allRecords: TrustRecord[] = [];
      const recordsByRootNext = new Map<string, TrustRecord[]>();
      const frontmatterByPath = new Map<string, Record<string, unknown>>();
      const vocabularyByRoot = new Map<string, { path: string; message: string }[]>();
      const cacheMisses: { file: TFile; root: string }[] = [];

      const addRecord = (file: TFile, root: string, parsed: { fm: Record<string, unknown>; headings: HeadingLine[] }) => {
        const baseIri = baseIriByRoot.get(root) ?? null;
        frontmatterByPath.set(file.path, parsed.fm);
        const record = buildTrustRecord(
          {
            path: file.path,
            bundleRoot: root,
            frontmatter: parsed.fm,
            headings: parsed.headings,
            mintId: (p) => (baseIri ? mintExpectedId(toBundlePath(p, root), baseIri) : p),
          },
          today,
          this.settings.dueSoonDays
        );
        allRecords.push(record);
        recordsByRootNext.get(root)!.push(record);
        const vocab = vocabularyByRoot.get(root)!;
        if (record.cls === "unknown" && record.type) {
          vocab.push({ path: file.path, message: `type "${record.type}" is not one of the LOKF vocabulary classes` });
        }
        if (record.invalidStatus) {
          vocab.push({ path: file.path, message: "status is not one of draft/stable/deprecated" });
        }
      };

      for (const root of roots) {
        recordsByRootNext.set(root, []);
        vocabularyByRoot.set(root, []);
        for (const file of filesByRoot.get(root) ?? []) {
          const cached = this.cachedConcept(file);
          if (cached) addRecord(file, root, cached);
          else cacheMisses.push({ file, root });
        }
      }
      await this.processQueue(cacheMisses, async ({ file, root }) => {
        addRecord(file, root, await this.readConcept(file));
      });

      computeReliedOnBy(allRecords, frontmatterByPath, baseIriByRoot);

      this.reportsByRoot.clear();
      this.recordsByRoot.clear();

      for (const root of roots) {
        const records = recordsByRootNext.get(root) ?? [];
        this.recordsByRoot.set(root, records);

        const health = computeHealth(records);
        const eligible = rankQueueAll(records);
        const queue = eligible.slice(0, this.settings.queueSize);
        for (const r of queue) {
          if (r.hasOpenQuestions) r.firstOpenQuestion = await this.readFirstOpenQuestion(r.path);
        }

        const openQuestions: OpenQuestionEntry[] = [];
        for (const r of records) {
          if (r.status === "deprecated" || !r.hasOpenQuestions) continue;
          const text = await this.readFirstOpenQuestion(r.path);
          if (text) openQuestions.push({ path: r.path, title: r.title, text });
        }

        const rootIndexPath = bundleRootIndexPath(root);
        const rootIndexFile = this.app.vault.getAbstractFileByPath(rootIndexPath);
        const titleCache = rootIndexFile instanceof TFile ? this.app.metadataCache.getFileCache(rootIndexFile) : null;
        const titleRaw: unknown = titleCache?.frontmatter?.["title"];
        const bundleTitle =
          (typeof titleRaw === "string" && titleRaw.trim() ? titleRaw.trim() : "") ||
          (root ? (root.split("/").pop() ?? root) : this.app.vault.getName());

        this.reportsByRoot.set(root, {
          root,
          title: bundleTitle,
          health,
          queue,
          // What is still waiting behind the queue, not "every note not shown":
          // a concept nobody needs to look at is not "more to check".
          queueRemaining: Math.max(0, eligible.length - queue.length),
          openQuestions,
          vocabularyIssues: vocabularyByRoot.get(root) ?? [],
          scanned: records.length,
          ioIssues: this.ioIssuesFor(root),
          feedbackCount: await this.countFeedbackEntries(),
        });
      }

      this.getCuratorView()?.onReportsUpdated();
      this.refreshStatusBar();
    } finally {
      this.busy = false;
    }
  }

  /**
   * How many feedback entries are waiting, or null when the file isn't
   * reachable from this vault - which is the usual case (§10): `.lokf/feedback.md`
   * sits beside `knowledge/`, so it is either above the vault root or inside a
   * dot-folder Obsidian never indexes. Null makes the report say so instead of
   * claiming "none".
   */
  private async countFeedbackEntries(): Promise<number | null> {
    const configured = this.settings.feedbackFile.trim();
    if (!configured) return null;
    const file = this.app.vault.getAbstractFileByPath(configured);
    if (!(file instanceof TFile)) return null;
    try {
      const content = await this.app.vault.cachedRead(file);
      const { body } = splitFrontmatter(content);
      return body.split("\n").filter((l) => /^\s*[-*]\s+\S/.test(l)).length;
    } catch {
      return null;
    }
  }

  private ioIssuesFor(root: string): string[] {
    const issues: string[] = [];
    const hiddenSegment = hiddenRootSegment(root);
    const rootIndexPath = bundleRootIndexPath(root);
    if (hiddenSegment) {
      issues.push(
        `Bundle root "${root}" sits inside "${hiddenSegment}", which Obsidian's file index never exposes - open that folder as its own vault instead.`
      );
    } else if (root && !(this.app.vault.getAbstractFileByPath(root) instanceof TFolder)) {
      issues.push(`Bundle root folder "${root}" does not exist in this vault.`);
    } else if (!(this.app.vault.getAbstractFileByPath(rootIndexPath) instanceof TFile)) {
      issues.push(`There is no ${rootIndexPath}, so no concept ids can be minted or checked.`);
    }
    return issues;
  }

  private async readFirstOpenQuestion(path: string): Promise<string | null> {
    const file = this.app.vault.getAbstractFileByPath(path);
    if (!(file instanceof TFile)) return null;
    try {
      const content = await this.app.vault.cachedRead(file);
      const { body } = splitFrontmatter(content);
      const lines = body.split("\n");
      const idx = lines.findIndex((l) => l.trim() === "## Open questions");
      if (idx === -1) return null;
      for (let i = idx + 1; i < lines.length; i++) {
        const line = lines[i]?.trim() ?? "";
        if (/^#{1,2}\s+/.test(line)) break;
        if (line.startsWith("-")) return line.replace(/^-\s*/, "");
      }
      return null;
    } catch {
      return null;
    }
  }

  getReports(): BundleReport[] {
    return [...this.reportsByRoot.values()];
  }

  getReportForActiveNote(): { report: BundleReport; record: TrustRecord | null } | null {
    const active = this.app.workspace.getActiveFile();
    if (!active) return null;
    const root = this.resolveRoot(active.path);
    if (root === null) return null;
    const report = this.reportsByRoot.get(root);
    if (!report) return null;
    const record = (this.recordsByRoot.get(root) ?? []).find((r) => r.path === active.path) ?? null;
    return { report, record };
  }

  // ---- TrustMarkerHost: the inline editor marker (inline.ts) ----

  trustMarkerEnabled(): boolean {
    return this.settings.trustMarker;
  }

  /** The trust tier and handoff hint for a note, derived live from the editor's
   *  current text so the marker is accurate as you type, or null when it is not
   *  a concept in a configured bundle. Headings come from the metadata cache
   *  (stable while frontmatter is edited); the id is irrelevant to the tier and
   *  handoff, so it isn't minted. */
  trustMarkerFor(file: TFile, doc: string): { label: TrustLabel; handoff: string | null } | null {
    const root = this.resolveRoot(file.path);
    if (root === null || file.extension !== "md" || isReserved(toBundlePath(file.path, root)) !== null) return null;
    const { hasFm, raw } = splitFrontmatter(doc);
    if (!hasFm) return null;
    let fm: Record<string, unknown>;
    try {
      const parsed: unknown = parseYaml(raw);
      fm = parsed && typeof parsed === "object" ? (parsed as Record<string, unknown>) : {};
    } catch {
      return null;
    }
    const headings: HeadingLine[] = (this.app.metadataCache.getFileCache(file)?.headings ?? []).map((h) => ({
      level: h.level,
      heading: h.heading,
    }));
    const record = buildTrustRecord(
      { path: file.path, bundleRoot: root, frontmatter: fm, headings, mintId: (p) => p },
      todayIso(),
      this.settings.dueSoonDays
    );
    return { label: trustLabel(record), handoff: handoffLabel(record)?.text ?? null };
  }

  // ---- SuggestHost: value completions inside frontmatter (D) ----

  suggestEnabled(): boolean {
    return this.settings.autocomplete;
  }

  /** The values a concept's frontmatter completes against - the curator's
   *  actor string, the lifecycle status, and dates - or null when the file is
   *  not a concept in a configured bundle. */
  suggestVocabularyFor(file: TFile): SuggestVocabulary | null {
    const root = this.resolveRoot(file.path);
    if (root === null || file.extension !== "md" || isReserved(toBundlePath(file.path, root)) !== null) return null;
    const today = todayIso();
    const curatorId = this.settings.curatorId.trim();
    const dates = [
      today,
      addMonthsIso(today, this.settings.intervalMonthsGroupA),
      addMonthsIso(today, this.settings.intervalMonthsGroupB),
      addMonthsIso(today, this.settings.intervalMonthsGroupC),
    ];
    return {
      statuses: ["draft", "stable", "deprecated"],
      actors: curatorId ? [`human:${curatorId}`] : [],
      dates: [...new Set(dates)],
    };
  }

  // ---- Review commands (open the card, never a blind one-tap verdict) ----

  /** The highest-ranked queued concept, preferring the active note's bundle so
   *  "review next" stays where the curator is working, then any other bundle. */
  private topQueued(): { path: string; root: string } | null {
    const active = this.getReportForActiveNote()?.report;
    const reports = this.getReports();
    const ordered = active ? [active, ...reports.filter((r) => r !== active)] : reports;
    for (const report of ordered) {
      const first = report.queue[0];
      if (first) return { path: first.path, root: report.root };
    }
    return null;
  }

  private async reviewNext(): Promise<void> {
    const top = this.topQueued();
    if (!top) {
      new Notice("LOKF Curator: nothing in the queue right now.");
      return;
    }
    await this.activateView();
    this.getCuratorView()?.reviewConcept(top.path, top.root);
  }

  private async reviewActiveNote(): Promise<void> {
    const active = this.getReportForActiveNote();
    const file = this.app.workspace.getActiveFile();
    if (!active || !active.record || !file) {
      new Notice("LOKF Curator: the active note is not a concept in a configured bundle.");
      return;
    }
    await this.activateView();
    this.getCuratorView()?.reviewConcept(file.path, active.report.root);
  }

  // ---- Review card support ----

  recordCardOpened(file: TFile): void {
    this.cardOpenedAt.set(file.path, file.stat.mtime);
    this.cardOpenedOnce.add(file.path);
  }

  /** "Wrong - I corrected it" stays disabled until the card has been open at
   *  least once for this file in this session (§6.3) - the person has to have
   *  actually looked at the concept before claiming to have corrected it. */
  hasReviewedCard(file: TFile): boolean {
    return this.cardOpenedOnce.has(file.path);
  }

  /** True when the file has been edited since its card was opened. False means
   *  the verb still fires, but only after the card asks "the note hasn't
   *  changed - did you mean Confirm?" (§6.3). */
  hasChangedSinceCardOpened(file: TFile): boolean {
    const openedAt = this.cardOpenedAt.get(file.path);
    return openedAt !== undefined && file.stat.mtime !== openedAt;
  }

  /** One concept's trust record, from whichever bundle holds it. The review
   *  card needs this rather than a lookup in the top-`queueSize` queue: the
   *  active note, or any concept opened from the panel, is very often not in
   *  the queue at all. */
  getRecord(path: string): TrustRecord | null {
    for (const records of this.recordsByRoot.values()) {
      const hit = records.find((r) => r.path === path);
      if (hit) return hit;
    }
    return null;
  }

  /**
   * Where a recorded source lives (§6.2): as a vault path, as a path relative
   * to the concept's bundle root, else "outside this vault". A `#fragment` or
   * `:line` suffix is stripped for opening and returned as a hint; an absolute
   * URL is never treated as a vault path.
   */
  resolveSource(source: string, root: string): SourceResolution {
    const trimmed = source.trim();
    if (hasUrlScheme(trimmed)) return { kind: "unreachable", displayPath: trimmed, hint: null };
    const { path, hint } = splitSourceLocator(trimmed);
    for (const candidate of [path, toVaultPath(path, root)]) {
      if (this.app.vault.getAbstractFileByPath(candidate) instanceof TFile) {
        return { kind: "vault", vaultPath: candidate, displayPath: trimmed, hint };
      }
    }
    return { kind: "unreachable", displayPath: trimmed, hint };
  }

  async openSourceSplit(resolution: SourceResolution): Promise<void> {
    if (resolution.kind !== "vault" || !resolution.vaultPath) return;
    const file = this.app.vault.getAbstractFileByPath(resolution.vaultPath);
    if (file instanceof TFile) {
      const leaf = this.app.workspace.getLeaf("split");
      await leaf.openFile(file);
    }
  }

  async proposeStaleAfterFor(record: TrustRecord, root: string, confirmationDate: string): Promise<string> {
    const overrides = await this.policyOverridesFor(root);
    const months = monthsForClass(
      record.type,
      [
        { classes: ["Service", "Dataset", "Table", "Metric", "AttestedComputation"], months: this.settings.intervalMonthsGroupA },
        { classes: ["Policy", "Playbook", "Tutorial", "Reference", "Document", "Person", "Organization"], months: this.settings.intervalMonthsGroupB },
        { classes: ["GlossaryTerm", "Explanation"], months: this.settings.intervalMonthsGroupC },
      ],
      overrides
    );
    return proposeStaleAfter(confirmationDate, months);
  }

  // ---- Verbs ----

  /**
   * The one write to a reserved file this plugin ever makes (§6.6): today's
   * `**Curation**` line for this curator in the bundle's `log.md`, upserted.
   * Read-modify-write goes through `vault.process`, which is atomic, so two
   * verbs pressed in quick succession can't lose each other's count.
   */
  private async withTally(root: string, mutate: (tally: CurationTally) => void, logExtra?: (log: string) => string): Promise<void> {
    const path = bundleLogPath(root);
    const file = this.app.vault.getAbstractFileByPath(path);
    const today = todayIso();
    const curatorId = this.settings.curatorId;

    const rewrite = (current: string): string => {
      const tally = readCurationTally(current, today, curatorId);
      mutate(tally);
      const next = upsertCurationLine(current, today, curatorId, tally);
      return logExtra ? logExtra(next) : next;
    };

    if (file instanceof TFile) await this.app.vault.process(file, rewrite);
    else await this.app.vault.create(path, rewrite(""));
  }

  /**
   * A body edit, applied atomically and confined to the `## Open questions`
   * section (§6.6): the frontmatter block is carried across verbatim, so a
   * transform can only ever touch body text.
   */
  private async processBody(file: TFile, transform: (body: string) => string): Promise<void> {
    await this.app.vault.process(file, (content) => {
      const { hasFm, raw, body } = splitFrontmatter(content);
      const nextBody = transform(body);
      return hasFm ? `---\n${raw}\n---${nextBody}` : nextBody;
    });
  }

  /**
   * Refuses a verb aimed at `index.md` or `log.md` (§6.6). The scan already
   * skips reserved files, so this only fires if one reaches a verb some other
   * way - and it says why rather than writing to a file that is not a concept.
   */
  private refuseReserved(file: TFile, root: string): boolean {
    const reserved = isReserved(toBundlePath(file.path, root));
    if (!reserved) return false;
    new Notice(
      `LOKF Curator: ${reserved}.md is a reserved bundle file, not a concept - nothing was written.`
    );
    return true;
  }

  async confirm(file: TFile, record: TrustRecord, root: string, staleAfter: string, openQuestionsAnswered: boolean | null): Promise<void> {
    if (this.refuseReserved(file, root)) return;
    const curatorId = await this.ensureCuratorId();
    if (!curatorId) return;
    const now = nowIso();
    await this.app.fileManager.processFrontMatter(file, (fm: Record<string, unknown>) => {
      const next = applyStaleAfter(applyConfirm(fm, curatorId, now), staleAfter);
      Object.keys(fm).forEach((k) => delete fm[k]);
      Object.assign(fm, next);
    });
    if (record.hasOpenQuestions && openQuestionsAnswered) {
      await this.processBody(file, deleteOpenQuestionsSection);
    }
    await this.withTally(root, (t) => (t.confirmed += 1));
    new Notice(`Confirmed ${record.title}.`);
    await this.refreshAllReports();
  }

  async sendBack(file: TFile, record: TrustRecord, root: string, note: string): Promise<void> {
    if (this.refuseReserved(file, root)) return;
    const curatorId = await this.ensureCuratorId();
    if (!curatorId) return;
    const dateOnly = todayIso();
    await this.app.fileManager.processFrontMatter(file, (fm: Record<string, unknown>) => {
      const next = applySendBack(fm);
      Object.keys(fm).forEach((k) => delete fm[k]);
      Object.assign(fm, next);
    });
    await this.processBody(file, (body) => appendOpenQuestion(body, curatorId, dateOnly, note));

    this.rememberSendBackNote(dateOnly, note);
    const hint = repeatedSendBackHint(this.sendBackNotesToday);
    await this.withTally(root, (t) => {
      t.sentBack += 1;
      t.repeatedSendBackNote = hint ?? undefined;
    });
    new Notice(`Sent ${record.title} back.`);
    await this.refreshAllReports();
  }

  async corrected(file: TFile, record: TrustRecord, root: string): Promise<void> {
    if (this.refuseReserved(file, root)) return;
    const curatorId = await this.ensureCuratorId();
    if (!curatorId) return;
    const now = nowIso();
    await this.app.fileManager.processFrontMatter(file, (fm: Record<string, unknown>) => {
      const next = applyCorrected(fm, curatorId, now);
      Object.keys(fm).forEach((k) => delete fm[k]);
      Object.assign(fm, next);
    });
    await this.withTally(root, (t) => (t.corrected += 1));
    new Notice(`Recorded your correction to ${record.title}.`);
    await this.refreshAllReports();
  }

  async retire(file: TFile, record: TrustRecord, root: string, reason: string): Promise<void> {
    if (this.refuseReserved(file, root)) return;
    const curatorId = await this.ensureCuratorId();
    if (!curatorId) return;
    await this.app.fileManager.processFrontMatter(file, (fm: Record<string, unknown>) => {
      const next = applyRetire(fm);
      Object.keys(fm).forEach((k) => delete fm[k]);
      Object.assign(fm, next);
    });
    const today = todayIso();
    const relPath = `../${toBundlePath(file.path, root)}`;
    await this.withTally(
      root,
      (t) => (t.retired += 1),
      (log) => appendDeprecationLine(log, today, record.title, relPath, reason)
    );
    new Notice(`Retired ${record.title}.`);
    await this.refreshAllReports();
  }

  async later(file: TFile, root: string, staleAfter?: string): Promise<void> {
    if (this.refuseReserved(file, root)) return;
    await this.app.fileManager.processFrontMatter(file, (fm: Record<string, unknown>) => {
      const next = applyLater(fm, staleAfter);
      Object.keys(fm).forEach((k) => delete fm[k]);
      Object.assign(fm, next);
    });
    // Nothing logged - a session that only deferred changed nothing worth a
    // Curation line (§6.5) - but the labels did change, so the report reruns.
    await this.refreshAllReports();
  }

  // ---- Step 3 commands ----

  private resolveCommandTarget(): string | null {
    const active = this.app.workspace.getActiveFile();
    if (active) {
      const r = this.resolveRoot(active.path);
      if (r !== null) return r;
    }
    const roots = this.bundleRoots();
    if (roots.length === 0) return "";
    if (roots.length === 1) return roots[0] ?? "";
    return null;
  }

  async createCurationPolicy(): Promise<void> {
    const root = this.resolveCommandTarget();
    if (root === null) {
      new Notice("LOKF Curator: several bundle roots are configured - open a note inside the target bundle first.");
      return;
    }
    const curatorId = await this.ensureCuratorId();
    if (!curatorId) return;
    const baseIri = (await this.findBaseIriFor(root)) ?? "";
    const path = toVaultPath("policies/knowledge-curation.md", root);
    if (this.app.vault.getAbstractFileByPath(path)) {
      new Notice(`LOKF Curator: ${path} already exists.`);
      return;
    }
    const content = renderCurationPolicyTemplate(baseIri, curatorId, nowIso());
    if (!this.app.vault.getAbstractFileByPath(toVaultPath("policies", root))) {
      await this.app.vault.createFolder(toVaultPath("policies", root));
    }
    await this.app.vault.create(path, content);
    new Notice(`LOKF Curator: created ${path}.`);
  }

  async recordSomethingMissing(): Promise<void> {
    const root = this.resolveCommandTarget();
    if (root === null) {
      new Notice("LOKF Curator: several bundle roots are configured - open a note inside the target bundle first.");
      return;
    }
    const curatorId = await this.ensureCuratorId();
    if (!curatorId) return;
    new RecordMissingModal(this.app, async (type, title, slugHint, hint) => {
      const baseIri = (await this.findBaseIriFor(root)) ?? "";
      const slug = slugHint || title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
      const path = toVaultPath(`${slug}.md`, root);
      if (this.app.vault.getAbstractFileByPath(path)) {
        new Notice(`LOKF Curator: ${path} already exists.`);
        return;
      }
      const now = nowIso();
      const content = renderMissingPlaceholder(baseIri, type, slug, title, curatorId, now, todayIso(), hint || "Librarian: derive from the repository.");
      await this.app.vault.create(path, content);
      await this.withTally(root, (t) => (t.gapsRecorded = (t.gapsRecorded ?? 0) + 1));
      new Notice(`LOKF Curator: recorded ${path} for the librarian.`);
      await this.refreshAllReports();
    }).open();
  }

  // ---- Status bar / view lifecycle ----

  private refreshStatusBar(): void {
    const active = this.getReportForActiveNote();
    if (active) {
      const { report, record } = active;
      const confirmed = `${report.health.humanConfirmed}/${report.health.total}`;
      if (record) {
        // Editing a concept: show that note's own trust tier, with the bundle
        // count kept in the tooltip.
        const label = trustLabel(record);
        this.statusEl.setText(`${label.short} · ${confirmed}`);
        this.statusEl.setAttribute(
          "aria-label",
          `${label.long} - ${confirmed} confirmed in ${report.title}. Click to open the curator panel.`
        );
      } else {
        this.statusEl.setText(`Confirmed ${confirmed}`);
        this.statusEl.setAttribute("aria-label", `${report.title} - click to open the curator panel`);
      }
      return;
    }
    const reports = this.getReports();
    if (reports.length === 1) {
      const r = reports[0]!;
      this.statusEl.setText(`Confirmed ${r.health.humanConfirmed}/${r.health.total}`);
    } else {
      this.statusEl.setText("Curate");
    }
    this.statusEl.setAttribute("aria-label", "LOKF Curator - click to open");
  }

  async activateView(): Promise<void> {
    const existing = this.app.workspace.getLeavesOfType(LOKF_CURATOR_VIEW_TYPE);
    let leaf: WorkspaceLeaf | null;
    if (existing.length) {
      leaf = existing[0] ?? null;
    } else {
      leaf = this.app.workspace.getRightLeaf(false);
      await leaf?.setViewState({ type: LOKF_CURATOR_VIEW_TYPE, active: true });
    }
    if (!leaf) return;
    void this.app.workspace.revealLeaf(leaf);
  }
}

class RecordMissingModal extends Modal {
  private type = "Service";
  private title = "";
  private slug = "";
  private hint = "";
  private onSubmit: (type: string, title: string, slug: string, hint: string) => void | Promise<void>;

  constructor(app: App, onSubmit: (type: string, title: string, slug: string, hint: string) => void | Promise<void>) {
    super(app);
    this.onSubmit = onSubmit;
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.createEl("h3", { text: "Record something missing" });
    contentEl.createEl("p", {
      text: "Writes a placeholder for the librarian - type, title, and one open question only. Never fill in facts you don't have.",
    });
    new Setting(contentEl).setName("Class").addDropdown((dd) => {
      const classes = [
        "Dataset",
        "Table",
        "Metric",
        "Service",
        "Playbook",
        "Tutorial",
        "Explanation",
        "Policy",
        "GlossaryTerm",
        "Reference",
        "Document",
        "Person",
        "Organization",
        "AttestedComputation",
      ];
      for (const c of classes) dd.addOption(c, c);
      dd.setValue(this.type).onChange((v) => (this.type = v));
    });
    new Setting(contentEl).setName("Title").addText((text) => text.onChange((v) => (this.title = v)));
    new Setting(contentEl).setName("Slug (optional)").setDesc("Vault-relative path under the bundle, without .md.").addText((text) => text.onChange((v) => (this.slug = v.trim())));
    new Setting(contentEl).setName("Hint for the librarian").addText((text) => text.onChange((v) => (this.hint = v)));
    new Setting(contentEl).addButton((btn) =>
      btn
        .setButtonText("Record")
        .setCta()
        .onClick(() => {
          if (!this.title.trim()) return;
          void this.onSubmit(this.type, this.title.trim(), this.slug, this.hint);
          this.close();
        })
    );
  }

  onClose() {
    this.contentEl.empty();
  }
}
