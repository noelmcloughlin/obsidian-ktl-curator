/**
 * Plain-Node regression check for bundle.ts / trust.ts / edits.ts - no
 * Obsidian runtime needed. Run with `npm run smoke-test`. Exits non-zero on
 * any failed expectation.
 *
 * All three modules are import-free of Obsidian and take already-parsed
 * frontmatter plus a fixed `today`, so the only thing this harness adds is a
 * YAML parser (a devDependency; the plugin itself uses Obsidian's parseYaml)
 * and a walk of scripts/fixtures/curation-bundle/.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { load as loadYaml } from "js-yaml";
import {
  splitFrontmatter,
  normalizeBundleRoot,
  hiddenRootSegment,
  normalizeBundleRoots,
  resolveBundleRoot,
  bundleRootIndexPath,
  toBundlePath,
  toVaultPath,
  readBaseIri,
  mintExpectedId,
  resolveRelationTarget,
  isReserved,
  classify,
  splitSourceLocator,
  hasUrlScheme,
  dirOf,
  autoBundleRoot,
  VISIBLE_BUNDLE_FOLDER,
} from "../src/bundle";
import {
  buildTrustRecord,
  computeReliedOnBy,
  computeHealth,
  rankQueue,
  rankQueueAll,
  hasOpenQuestionsHeading,
  normalizeDate,
  monthsForClass,
  proposeStaleAfter,
  parseCurationPolicyTable,
  DEFAULT_STALE_GROUPS,
  type TrustRecord,
  type HeadingLine,
  type HealthCounts,
} from "../src/trust";
import { trustLabel, handoffLabel } from "../src/trust-label";
import { detectSuggestContext, withinFrontmatter, kindForKey } from "../src/suggest-context";
import {
  normalizeVerified,
  applyConfirm,
  applyStaleAfter,
  applySendBack,
  applyCorrected,
  applyRetire,
  applyLater,
  appendOpenQuestion,
  deleteOpenQuestionsSection,
  upsertCurationLine,
  appendDeprecationLine,
  repeatedSendBackHint,
  parseCurationTally,
  readCurationTally,
} from "../src/edits";
import { FIELD_ORDER, LOKF_FIELD_DOCS, resolveFieldDocs } from "../src/fields";
import lokfVocab from "../src/lokf-vocab.json";

let failures = 0;

function expect(name: string, condition: boolean, detail: string): boolean {
  if (condition) {
    console.log(`  ok - ${name}`);
  } else {
    failures++;
    console.error(`  FAIL - ${name}\n         ${detail}`);
  }
  return condition;
}

function section(name: string, fn: () => void): void {
  console.log(`\n${name}`);
  fn();
}

const TODAY = "2026-09-10";

// ---- bundle.ts ----

section("bundle.ts - bundle roots", () => {
  expect("normalizeBundleRoot trims/slashes", normalizeBundleRoot(" /knowledge/ ") === "knowledge", normalizeBundleRoot(" /knowledge/ "));
  expect("normalizeBundleRoot backslashes", normalizeBundleRoot(".\\knowledge") === "knowledge", normalizeBundleRoot(".\\knowledge"));
  expect("hiddenRootSegment finds dot folder", hiddenRootSegment(".lokf/knowledge") === ".lokf", String(hiddenRootSegment(".lokf/knowledge")));
  expect("hiddenRootSegment null for clean root", hiddenRootSegment("knowledge") === null, String(hiddenRootSegment("knowledge")));
  expect("auto-detect: knowledge_bundle/index.md in a plain notes vault becomes the root", autoBundleRoot(false, true) === VISIBLE_BUNDLE_FOLDER, String(autoBundleRoot(false, true)));
  expect("auto-detect: a vault whose root index.md is a header stays the whole-vault bundle", autoBundleRoot(true, true) === null, String(autoBundleRoot(true, true)));
  expect("auto-detect: nothing without the visible folder's index.md", autoBundleRoot(false, false) === null, String(autoBundleRoot(false, false)));

  const roots = normalizeBundleRoots(["b", "a/nested", "a"]);
  expect("normalizeBundleRoots sorts longest-first", roots[0] === "a/nested", JSON.stringify(roots));

  expect("resolveBundleRoot implicit whole vault", resolveBundleRoot("foo/bar.md", []) === "", "");
  expect("resolveBundleRoot most specific match", resolveBundleRoot("a/nested/x.md", roots) === "a/nested", String(resolveBundleRoot("a/nested/x.md", roots)));
  expect("resolveBundleRoot outside every root", resolveBundleRoot("outside/x.md", ["a"]) === null, String(resolveBundleRoot("outside/x.md", ["a"])));

  expect("bundleRootIndexPath root", bundleRootIndexPath("knowledge") === "knowledge/index.md", bundleRootIndexPath("knowledge"));
  expect("bundleRootIndexPath implicit", bundleRootIndexPath("") === "index.md", bundleRootIndexPath(""));
  expect("toBundlePath strips root", toBundlePath("knowledge/services/a.md", "knowledge") === "services/a.md", toBundlePath("knowledge/services/a.md", "knowledge"));
  expect("toVaultPath re-adds root", toVaultPath("services/a.md", "knowledge") === "knowledge/services/a.md", toVaultPath("services/a.md", "knowledge"));

  expect("isReserved index.md", isReserved("knowledge/index.md") === "index", String(isReserved("knowledge/index.md")));
  expect("isReserved log.md", isReserved("knowledge/log.md") === "log", String(isReserved("knowledge/log.md")));
  expect("isReserved diataxis.md (Registrar-generated map, not a concept)", isReserved("knowledge/diataxis.md") === "diataxis", String(isReserved("knowledge/diataxis.md")));
  expect("isReserved concept", isReserved("knowledge/services/a.md") === null, String(isReserved("knowledge/services/a.md")));
});

section("bundle.ts - frontmatter / classify / relations", () => {
  const { hasFm, raw, body } = splitFrontmatter("---\ntype: Service\n---\nBody text.\n");
  expect("splitFrontmatter finds fm", hasFm && raw.includes("type: Service") && body.trim() === "Body text.", raw + "|" + body);

  expect("readBaseIri present", readBaseIri({ base_iri: "https://x.test/" }) === "https://x.test/", "");
  expect("readBaseIri absent", readBaseIri({}) === null, "");

  expect("classify known", classify("GlossaryTerm") === "known", classify("GlossaryTerm"));
  expect("classify normalizes spaces", classify("Attested Computation") === "known", classify("Attested Computation"));
  expect("classify unknown", classify("Workflow") === "unknown", classify("Workflow"));

  expect(
    "mintExpectedId",
    mintExpectedId("services/orders api.md", "https://x.test/") === "https://x.test/services/orders%20api",
    mintExpectedId("services/orders api.md", "https://x.test/")
  );

  const internal = resolveRelationTarget("https://x.test/services/a", "https://x.test/");
  expect("resolveRelationTarget internal-iri", internal.kind === "internal-iri" && internal.resolvedPath === "services/a", JSON.stringify(internal));
  const relative = resolveRelationTarget("./services/a.md", "https://x.test/");
  expect("resolveRelationTarget internal-relative strips ./", relative.kind === "internal-relative" && relative.resolvedPath === "services/a.md", JSON.stringify(relative));
  const external = resolveRelationTarget("https://other.test/thing", "https://x.test/");
  expect("resolveRelationTarget external-iri", external.kind === "external-iri", JSON.stringify(external));
  const malformed = resolveRelationTarget(undefined, "https://x.test/");
  expect("resolveRelationTarget malformed", malformed.kind === "malformed", JSON.stringify(malformed));
  expect("resolveRelationTarget describes a mapping by shape, never [object Object]", resolveRelationTarget({}, null).raw === "<a mapping>", resolveRelationTarget({}, null).raw);
});

section("bundle.ts - source locators (§6.2)", () => {
  const cases: [string, string, string | null][] = [
    ["services/orders/openapi.yaml", "services/orders/openapi.yaml", null],
    ["src/main.ts:42", "src/main.ts", ":42"],
    ["src/main.ts:42-60", "src/main.ts", ":42-60"],
    ["docs/guide.md#install", "docs/guide.md", "#install"],
    ["src/main.ts:42#anchor", "src/main.ts", ":42#anchor"],
    // The scheme colon must never be mistaken for a line number.
    ["https://acme.example/spec", "https://acme.example/spec", null],
  ];
  for (const [input, path, hint] of cases) {
    const got = splitSourceLocator(input);
    expect(`splitSourceLocator("${input}")`, got.path === path && got.hint === hint, JSON.stringify(got));
  }
  expect("hasUrlScheme spots an absolute URL", hasUrlScheme("https://acme.example/spec"), "");
  expect("hasUrlScheme leaves a bare path alone", !hasUrlScheme("src/main.ts"), "");
  expect("dirOf finds the folder", dirOf("a/b/c.md") === "a/b", dirOf("a/b/c.md"));
  expect("dirOf is empty at the root", dirOf("c.md") === "", dirOf("c.md"));
});

// ---- trust.ts against the fixture bundle ----

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const FIXTURE_ROOT = join(__dirname, "fixtures", "curation-bundle", "knowledge");

function walkMarkdown(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...walkMarkdown(full));
    else if (entry.endsWith(".md")) out.push(full);
  }
  return out;
}

function parseFixture(content: string): { hasFm: boolean; data: Record<string, unknown>; body: string } {
  const { hasFm, raw, body } = splitFrontmatter(content);
  if (!hasFm) return { hasFm: false, data: {}, body };
  const parsed = loadYaml(raw);
  return { hasFm: true, data: parsed && typeof parsed === "object" ? (parsed as Record<string, unknown>) : {}, body };
}

/** Minimal heading extractor for the fixture bodies: matches Obsidian's
 *  metadataCache.headings shape closely enough for hasOpenQuestionsHeading. */
function extractHeadings(body: string): HeadingLine[] {
  const out: HeadingLine[] = [];
  for (const line of body.split("\n")) {
    const m = line.match(/^(#{1,6})\s+(.*\S)\s*$/);
    if (m) out.push({ level: m[1]!.length, heading: m[2]! });
  }
  return out;
}

function loadFixtureBundle(): { records: TrustRecord[]; frontmatterByPath: Map<string, Record<string, unknown>>; bodyByPath: Map<string, string> } {
  const files = walkMarkdown(FIXTURE_ROOT);
  const baseIri = "https://example.test/knowledge/";
  const frontmatterByPath = new Map<string, Record<string, unknown>>();
  const bodyByPath = new Map<string, string>();
  const records: TrustRecord[] = [];

  for (const full of files) {
    const rel = relative(join(FIXTURE_ROOT, ".."), full).split(sep).join("/"); // "knowledge/..."
    if (isReserved(rel) !== null) continue;
    const content = readFileSync(full, "utf8");
    const { hasFm, data, body } = parseFixture(content);
    if (!hasFm) continue;
    frontmatterByPath.set(rel, data);
    bodyByPath.set(rel, body);
    const record = buildTrustRecord(
      {
        path: rel,
        bundleRoot: "knowledge",
        frontmatter: data,
        headings: extractHeadings(body),
        mintId: (p) => mintExpectedId(toBundlePath(p, "knowledge"), baseIri),
      },
      TODAY
    );
    if (record.hasOpenQuestions) {
      const lines = body.split("\n");
      const idx = lines.findIndex((l) => l.trim() === "## Open questions");
      const bullet = lines.slice(idx + 1).find((l) => l.trim().startsWith("-"));
      record.firstOpenQuestion = bullet ? bullet.trim().replace(/^-\s*/, "") : null;
    }
    records.push(record);
  }

  computeReliedOnBy(records, frontmatterByPath, new Map([["knowledge", baseIri]]));
  return { records, frontmatterByPath, bodyByPath };
}

section("trust.ts - per-concept labels", () => {
  const { records } = loadFixtureBundle();
  const byPath = new Map(records.map((r) => [r.path, r]));
  const get = (name: string): TrustRecord => {
    const r = [...byPath.entries()].find(([p]) => p.endsWith(name))?.[1];
    if (!r) throw new Error(`fixture not found: ${name}`);
    return r;
  };

  expect("human-confirmed -> humanConfirmed", get("human-confirmed.md").humanConfirmed, "");
  expect("automation-only -> automationOnly, not humanConfirmed", get("automation-only.md").automationOnly && !get("automation-only.md").humanConfirmed, "");
  expect("unchecked -> unchecked", get("unchecked.md").unchecked, "");
  expect("orders-term -> draft with open questions", get("orders-term.md").status === "draft" && get("orders-term.md").hasOpenQuestions, "");
  expect("other-term -> draft without open questions", get("other-term.md").status === "draft" && !get("other-term.md").hasOpenQuestions, "");
  expect("edited-since-confirmed -> editedSinceConfirmed", get("edited-since-confirmed.md").editedSinceConfirmed === true, "");
  expect("past-review -> pastReview, not dueSoon", get("past-review.md").pastReview && !get("past-review.md").dueSoon, "");
  expect("due-soon -> dueSoon, not pastReview", get("due-soon.md").dueSoon && !get("due-soon.md").pastReview, "");
  expect("retired-service -> status deprecated", get("retired-service.md").status === "deprecated", "");
  expect("bare-verified -> normalized to humanConfirmed", get("bare-verified.md").humanConfirmed, "");
  expect("unknown-type -> cls unknown", get("unknown-type.md").cls === "unknown", "");
  expect("invalid-status -> invalidStatus flag, status stable fallback excluded", get("invalid-status.md").invalidStatus, "");
  expect(
    "mentions-open-questions -> hasOpenQuestions false (no substring match)",
    !get("mentions-open-questions.md").hasOpenQuestions,
    ""
  );
  expect("orders-term relied on by 4", get("orders-term.md").reliedOnBy === 4, String(get("orders-term.md").reliedOnBy));
});

section("trust.ts - health counts (not a partition), exact numbers", () => {
  const { records } = loadFixtureBundle();
  const health = computeHealth(records);
  // Every number below is derived by hand from the fixture bundle, so a rule
  // change that silently shifts a count fails here rather than in a vault.
  const expected: HealthCounts = {
    total: 14, // every concept in the fixture, retired included
    // human-confirmed, edited-since-confirmed, past-review, due-soon, bare-verified
    humanConfirmed: 5,
    automationOnly: 1, // automation-only
    // unchecked, orders-term, other-term, unknown-type, invalid-status,
    // mentions-open-questions, knowledge-curation
    unchecked: 7,
    drafts: 2, // orders-term, other-term
    pastReview: 1, // past-review
    editedSinceConfirmed: 1, // edited-since-confirmed
    retired: 1, // retired-service
  };
  expect(
    "all seven counts plus the total match the fixture exactly",
    JSON.stringify(health) === JSON.stringify(expected),
    `got      ${JSON.stringify(health)}\n         expected ${JSON.stringify(expected)}`
  );

  // "Labels overlap by design" - the same concept carries several at once, so
  // no one should read the health line as a breakdown of the total.
  const byPath = new Map(records.map((r) => [r.path, r]));
  const pastReviewRecord = [...byPath.values()].find((r) => r.path.endsWith("past-review.md"))!;
  expect(
    "one concept can be human-confirmed AND past its review date at once",
    pastReviewRecord.humanConfirmed && pastReviewRecord.pastReview,
    JSON.stringify(pastReviewRecord)
  );
  const draftUnchecked = [...byPath.values()].find((r) => r.path.endsWith("other-term.md"))!;
  expect(
    "and a draft nobody has checked is counted under both",
    draftUnchecked.status === "draft" && draftUnchecked.unchecked,
    JSON.stringify(draftUnchecked)
  );
});

section("trust.ts - dueSoonDays is honoured, not hardcoded", () => {
  const fm = { stale_after: "2026-10-05" }; // 25 days after the fixture "today"
  const build = (dueSoonDays: number) =>
    buildTrustRecord({ path: "x.md", bundleRoot: "", frontmatter: fm, headings: [], mintId: () => "x" }, TODAY, dueSoonDays);
  expect("inside a 30-day window it is due soon", build(30).dueSoon, "");
  expect("outside a 7-day window it is not", !build(7).dueSoon, "");
  expect("a narrower window never makes it past review", !build(7).pastReview, "");
});

section("trust.ts - due-soon flips to past-review when today advances", () => {
  const { records } = loadFixtureBundle();
  const dueSoonRaw = records.find((r) => r.path.endsWith("due-soon.md"))!;
  const dueSoonFm = { stale_after: "2026-09-20" };
  const laterRecord = buildTrustRecord(
    { path: dueSoonRaw.path, bundleRoot: "knowledge", frontmatter: { ...dueSoonFm, verified: [{ by: "human:ada", at: "2026-01-01T05:00:00Z" }] }, headings: [], mintId: () => "x" },
    "2026-09-21"
  );
  expect("moving today past stale_after flips dueSoon -> pastReview", laterRecord.pastReview && !laterRecord.dueSoon, JSON.stringify(laterRecord));
});

section("trust.ts - ranked queue", () => {
  const { records } = loadFixtureBundle();
  const capped = rankQueue(records, 5);
  expect("queue respects the limit", capped.length === 5, String(capped.length));
  expect("queue excludes retired", !capped.some((r) => r.status === "deprecated"), JSON.stringify(capped.map((r) => r.path)));

  // Full ranking (no cap) to check group ordering independent of which
  // group-3/4 ties happen to survive a 5-item cap.
  const full = rankQueue(records, 100);
  const idx = (name: string) => full.findIndex((r) => r.path.endsWith(name));
  const pastReviewIdx = idx("past-review.md");
  const editedSinceIdx = idx("edited-since-confirmed.md");
  const draftWithOqIdx = idx("orders-term.md");
  const uncheckedIdx = idx("unchecked.md");
  const draftNoOqIdx = idx("other-term.md");
  expect(
    "group 1 (past review / edited since) outranks group 2 (draft+open questions) outranks group 3 (unchecked)",
    [pastReviewIdx, editedSinceIdx, draftWithOqIdx, uncheckedIdx].every((i) => i !== -1) &&
      pastReviewIdx < draftWithOqIdx &&
      editedSinceIdx < draftWithOqIdx &&
      draftWithOqIdx < uncheckedIdx,
    JSON.stringify(full.map((r) => r.path))
  );
  expect(
    "unreferenced draft-without-open-questions never outranks the relied-upon glossary term",
    draftWithOqIdx !== -1 && draftNoOqIdx !== -1 && draftWithOqIdx < draftNoOqIdx,
    JSON.stringify(full.map((r) => r.path))
  );
});

section("trust.ts - reliance counting across bundles and folders", () => {
  const baseA = "https://a.example/knowledge/";
  const baseB = "https://b.example/knowledge/";
  const fmByPath = new Map<string, Record<string, unknown>>([
    // Bundle A cites bundle B's minted IRI - it must count for B (§4).
    ["a/services/one.md", { type: "Service", dependsOn: [`${baseB}glossary/term`] }],
    // A bundle-root-relative target inside A.
    ["a/services/two.md", { type: "Service", dependsOn: ["glossary/local.md"] }],
    // A sibling-relative target: written as a bare filename next to the citer.
    ["a/glossary/three.md", { type: "GlossaryTerm", relatedTo: ["local"] }],
    // A stale target that names nothing must inflate nobody's count.
    ["a/services/four.md", { type: "Service", dependsOn: [`${baseA}services/ghost`] }],
    ["a/glossary/local.md", { type: "GlossaryTerm" }],
    ["b/glossary/term.md", { type: "GlossaryTerm" }],
  ]);

  const mk = (path: string, root: string, baseIri: string) =>
    buildTrustRecord(
      {
        path,
        bundleRoot: root,
        frontmatter: fmByPath.get(path)!,
        headings: [],
        mintId: (p) => mintExpectedId(toBundlePath(p, root), baseIri),
      },
      TODAY
    );

  const records = [
    mk("a/services/one.md", "a", baseA),
    mk("a/services/two.md", "a", baseA),
    mk("a/glossary/three.md", "a", baseA),
    mk("a/services/four.md", "a", baseA),
    mk("a/glossary/local.md", "a", baseA),
    mk("b/glossary/term.md", "b", baseB),
  ];
  computeReliedOnBy(records, fmByPath, new Map([["a", baseA], ["b", baseB]]));
  const by = (name: string) => records.find((r) => r.path.endsWith(name))!;

  expect("a cross-bundle IRI counts for the TARGET bundle's concept", by("b/glossary/term.md").reliedOnBy === 1, String(by("b/glossary/term.md").reliedOnBy));
  expect(
    "bundle-root-relative and sibling-relative targets both resolve",
    by("a/glossary/local.md").reliedOnBy === 2,
    String(by("a/glossary/local.md").reliedOnBy)
  );
  expect("a target naming no concept counts for nobody", records.every((r) => !r.path.endsWith("ghost")), "");
  expect("the citing concepts themselves are relied on by nobody", by("a/services/one.md").reliedOnBy === 0, String(by("a/services/one.md").reliedOnBy));
});

section("trust.ts - a concept naming itself is not relied upon by itself", () => {
  const base = "https://x.example/k/";
  const fm = new Map<string, Record<string, unknown>>([["s/self.md", { type: "Service", relatedTo: [`${base}s/self`] }]]);
  const record = buildTrustRecord(
    { path: "s/self.md", bundleRoot: "", frontmatter: fm.get("s/self.md")!, headings: [], mintId: (p) => mintExpectedId(p, base) },
    TODAY
  );
  computeReliedOnBy([record], fm, new Map([["", base]]));
  expect("self-reference does not inflate reliedOnBy", record.reliedOnBy === 0, String(record.reliedOnBy));
});

section("trust.ts - every recorded source is captured, in order", () => {
  const record = buildTrustRecord(
    {
      path: "x.md",
      bundleRoot: "",
      frontmatter: {
        resource: "services/orders/openapi.yaml",
        sources: [{ resource: "docs/orders.md" }, { resource: "https://acme.example/spec" }, { title: "no resource here" }],
      },
      headings: [],
      mintId: () => "x",
    },
    TODAY
  );
  expect("resource comes first, then each sources[].resource", JSON.stringify(record.sources) === JSON.stringify(["services/orders/openapi.yaml", "docs/orders.md", "https://acme.example/spec"]), JSON.stringify(record.sources));
  expect("source stays the primary one", record.source === "services/orders/openapi.yaml", String(record.source));
  const noResource = buildTrustRecord(
    { path: "y.md", bundleRoot: "", frontmatter: { sources: [{ resource: "only/this.md" }] }, headings: [], mintId: () => "y" },
    TODAY
  );
  expect("falls back to sources[0].resource when there is no resource", noResource.source === "only/this.md", String(noResource.source));
});

section("trust.ts - queue cap vs. what is still waiting behind it", () => {
  const { records } = loadFixtureBundle();
  const all = rankQueueAll(records);
  const top = rankQueue(records, 3);
  expect("rankQueue is exactly the head of the full ranking", JSON.stringify(top.map((r) => r.path)) === JSON.stringify(all.slice(0, 3).map((r) => r.path)), "");
  expect("the remainder is what the report reports as 'more not yet checked'", all.length - top.length === all.length - 3, "");
  expect("retired concepts are in neither", !all.some((r) => r.status === "deprecated"), "");
});

section("trust.ts - stale_after proposal and policy table", () => {
  expect("monthsForClass default group", monthsForClass("Service", DEFAULT_STALE_GROUPS, new Map()) === 6, "");
  expect("monthsForClass fallback for unlisted class", monthsForClass("Nonsense", DEFAULT_STALE_GROUPS, new Map()) === 12, "");
  expect("proposeStaleAfter adds months", proposeStaleAfter("2026-09-08", 6) === "2027-03-08", proposeStaleAfter("2026-09-08", 6));

  const policyBody = readFileSync(join(FIXTURE_ROOT, "policies", "knowledge-curation.md"), "utf8");
  const { body } = splitFrontmatter(policyBody);
  const overrides = parseCurationPolicyTable(body);
  expect("policy override applies to matching class", overrides.get("service") === 3, JSON.stringify([...overrides]));
  expect("malformed row (no number of months) leaves no override", !overrides.has("policy"), JSON.stringify([...overrides]));
});

section("trust.ts - normalizeDate handles both Date and string", () => {
  expect("normalizeDate on Date object", normalizeDate(new Date("2026-09-10T00:00:00Z")) === "2026-09-10", String(normalizeDate(new Date("2026-09-10T00:00:00Z"))));
  expect("normalizeDate on plain string", normalizeDate("2026-09-10") === "2026-09-10", String(normalizeDate("2026-09-10")));
});

section("trust.ts - hasOpenQuestionsHeading exact match only", () => {
  expect("matches exact heading", hasOpenQuestionsHeading([{ level: 2, heading: "Open questions" }]), "");
  expect("ignores wrong level", !hasOpenQuestionsHeading([{ level: 3, heading: "Open questions" }]), "");
  expect("ignores different heading", !hasOpenQuestionsHeading([{ level: 2, heading: "Something about Open questions" }]), "");
});

// ---- edits.ts ----

const EXAMPLE_FM = {
  type: "Service",
  id: "https://acme.example/knowledge/services/orders-api",
  title: "Orders API",
  description: "REST API serving order data to the CLI and web UI.",
  resource: "services/orders/openapi.yaml",
  generated: { by: "process:lokf-librarian", at: "2026-09-01T05:00:00Z" },
  verified: [{ by: "process:lokf-librarian", at: "2026-09-07T05:00:00Z" }],
  status: "draft",
};

section("edits.ts - normalizeVerified", () => {
  expect("bare mapping -> one-element list", normalizeVerified({ by: "human:a", at: "x" }).length === 1, "");
  expect("absent -> empty list", normalizeVerified(undefined).length === 0, "");
  const list = normalizeVerified([{ by: "human:a", at: "x" }, { by: "human:b", at: "y" }]);
  expect("list passthrough preserves order", list[0]!.by === "human:a" && list[1]!.by === "human:b", JSON.stringify(list));
});

section("edits.ts - Confirm", () => {
  const fm = structuredClone(EXAMPLE_FM);
  const next = applyConfirm(fm, "ada-lovelace", "2026-09-08T14:00:00Z");
  const events = next["verified"] as { by: string; at: string }[];
  expect("prior event preserved byte-for-byte in order", events[0]!.by === "process:lokf-librarian" && events[0]!.at === "2026-09-07T05:00:00Z", JSON.stringify(events));
  expect("appends human event", events[1]!.by === "human:ada-lovelace" && events[1]!.at === "2026-09-08T14:00:00Z", JSON.stringify(events));
  expect("removes status: draft", !("status" in next), JSON.stringify(next));
  expect("never mutates the caller's object", (fm["verified"] as unknown[]).length === 1, "");
  const withStale = applyStaleAfter(next, "2027-03-08");
  expect("applyStaleAfter sets the accepted date", withStale["stale_after"] === "2027-03-08", "");
});

section("edits.ts - Wrong / send back", () => {
  const fm = structuredClone(EXAMPLE_FM);
  delete (fm as Record<string, unknown>)["status"];
  const next = applySendBack(fm);
  expect("sets status: draft even if absent", next["status"] === "draft", "");
  expect("touches nothing else", next["title"] === fm["title"] && next["id"] === fm["id"], "");
});

section("edits.ts - Wrong / corrected", () => {
  const fm = structuredClone(EXAMPLE_FM);
  const next = applyCorrected(fm, "ada-lovelace", "2026-09-08T14:05:00Z");
  const gen = next["generated"] as { by: string; at: string };
  expect("generated REPLACED, not appended", gen.by === "human:ada-lovelace" && gen.at === "2026-09-08T14:05:00Z", JSON.stringify(gen));
  const events = next["verified"] as { by: string; at: string }[];
  expect("verified event appended, prior preserved", events.length === 2 && events[0]!.by === "process:lokf-librarian", JSON.stringify(events));
  expect("status: draft removed", !("status" in next), "");
});

section("edits.ts - Retire", () => {
  const fm = structuredClone(EXAMPLE_FM);
  const next = applyRetire(fm);
  expect("only status changes", next["status"] === "deprecated" && next["title"] === fm["title"], JSON.stringify(next));
});

section("edits.ts - Later", () => {
  const fm = structuredClone(EXAMPLE_FM);
  delete (fm as Record<string, unknown>)["status"];
  const withDate = applyLater(fm, "2026-12-01");
  expect("Later sets status: draft and stale_after when a date is given", withDate["status"] === "draft" && withDate["stale_after"] === "2026-12-01", JSON.stringify(withDate));
  const withoutDate = applyLater(fm);
  expect("Later without a date leaves stale_after untouched", !("stale_after" in withoutDate), JSON.stringify(withoutDate));
});

section("edits.ts - Open questions section, created/appended/deleted, exact heading only", () => {
  // The exactness rule, checked on the paths that actually run: a body that
  // only *mentions* the phrase must be left completely alone by both edits.
  const prose = "We discuss Open questions in this section, at length.\n";
  expect("delete leaves a prose mention untouched", deleteOpenQuestionsSection(prose) === prose, deleteOpenQuestionsSection(prose));
  expect(
    "append creates a real heading rather than writing under the prose mention",
    appendOpenQuestion(prose, "ada", "2026-09-08", "note").includes("## Open questions"),
    appendOpenQuestion(prose, "ada", "2026-09-08", "note")
  );

  const created = appendOpenQuestion("Some body text.\n", "ada", "2026-09-08", "the endpoint moved to /v2/orders");
  expect("creates heading when absent", created.includes("## Open questions") && created.includes("- 2026-09-08, human:ada: the endpoint moved to /v2/orders"), created);

  const withSection = "Body.\n\n## Open questions\n\n- 2026-09-01, human:bob: first question\n";
  const appended = appendOpenQuestion(withSection, "ada", "2026-09-08", "second question");
  expect(
    "appends to an existing section, keeping the first bullet",
    appended.includes("first question") && appended.includes("- 2026-09-08, human:ada: second question"),
    appended
  );

  const deleted = deleteOpenQuestionsSection(withSection);
  expect("deletes the whole section", !deleted.includes("Open questions") && !deleted.includes("first question"), deleted);
});

section("edits.ts - log.md upsert", () => {
  let log = "";
  log = upsertCurationLine(log, "2026-09-08", "ada-lovelace", { confirmed: 4, sentBack: 1, corrected: 1, retired: 1 });
  expect("creates today's heading", log.includes("## 2026-09-08"), log);
  expect("writes the curation line", log.includes("* **Curation**: human:ada-lovelace confirmed 4, sent back 1, corrected 1, retired 1."), log);

  log = upsertCurationLine(log, "2026-09-08", "ada-lovelace", { confirmed: 5, sentBack: 1, corrected: 1, retired: 1 });
  const curationLines = log.split("\n").filter((l) => l.includes("**Curation**: human:ada-lovelace"));
  expect("updates in place rather than duplicating", curationLines.length === 1 && curationLines[0]!.includes("confirmed 5"), log);

  log = upsertCurationLine(log, "2026-09-08", "bob", { confirmed: 1, sentBack: 0, corrected: 0, retired: 0 });
  expect("a second curator the same day gets their own line", log.includes("human:bob confirmed 1"), log);

  log = upsertCurationLine(log, "2026-09-01", "ada-lovelace", { confirmed: 2, sentBack: 0, corrected: 0, retired: 0 });
  const headingIdxNew = log.indexOf("## 2026-09-08");
  const headingIdxOld = log.indexOf("## 2026-09-01");
  expect("newer date stays above older date (prepended)", headingIdxNew !== -1 && headingIdxOld !== -1 && headingIdxNew < headingIdxOld, log);

  log = appendDeprecationLine(log, "2026-09-08", "Legacy Orders Sync", "../services/legacy-orders-sync.md", "replaced by the Orders API");
  expect(
    "deprecation line added under today's heading",
    log.includes("* **Deprecation**: [Legacy Orders Sync](../services/legacy-orders-sync.md) retired - replaced by the Orders API."),
    log
  );
});

section("edits.ts - GUARDRAIL: no verb touches a key outside its own row of §6.3", () => {
  // The plan's guardrail, as a test: diff the frontmatter before and after
  // each verb and fail on any key the verb's table does not name. `type`,
  // relation fields, and everything else must survive untouched.
  const rich = {
    ...structuredClone(EXAMPLE_FM),
    dependsOn: ["https://acme.example/knowledge/datasets/orders-db"],
    isPartOf: ["https://acme.example/knowledge/services/platform"],
    tags: ["orders", "api"],
    endpoint: "https://api.acme.example/orders",
    stale_after: "2026-12-01",
  };

  const changedKeys = (before: Record<string, unknown>, after: Record<string, unknown>): string[] => {
    const keys = new Set([...Object.keys(before), ...Object.keys(after)]);
    return [...keys].filter((k) => JSON.stringify(before[k]) !== JSON.stringify(after[k])).sort();
  };

  const cases: { verb: string; run: (fm: Record<string, unknown>) => Record<string, unknown>; allowed: string[] }[] = [
    { verb: "Confirm", run: (fm) => applyStaleAfter(applyConfirm(fm, "ada", "2026-09-08T14:00:00Z"), "2027-03-08"), allowed: ["stale_after", "status", "verified"] },
    { verb: "Send back", run: (fm) => applySendBack(fm), allowed: ["status"] },
    { verb: "Corrected", run: (fm) => applyCorrected(fm, "ada", "2026-09-08T14:00:00Z"), allowed: ["generated", "status", "verified"] },
    { verb: "Retire", run: (fm) => applyRetire(fm), allowed: ["status"] },
    { verb: "Later", run: (fm) => applyLater(fm, "2026-12-24"), allowed: ["stale_after", "status"] },
  ];

  for (const { verb, run, allowed } of cases) {
    const before = structuredClone(rich);
    const after = run(structuredClone(rich));
    const touched = changedKeys(before, after);
    const forbidden = touched.filter((k) => !allowed.includes(k));
    expect(`${verb} changes only ${allowed.join("/")}`, forbidden.length === 0, `also changed: ${forbidden.join(", ")}`);
    expect(`${verb} leaves type and relation fields alone`, after["type"] === before["type"] && JSON.stringify(after["dependsOn"]) === JSON.stringify(before["dependsOn"]) && JSON.stringify(after["isPartOf"]) === JSON.stringify(before["isPartOf"]), JSON.stringify(after));
  }

  // Retire in particular must not disturb an existing stale_after or verified.
  const retired = applyRetire(structuredClone(rich));
  expect(
    "Retire leaves an existing stale_after and verified untouched",
    retired["stale_after"] === rich.stale_after && JSON.stringify(retired["verified"]) === JSON.stringify(rich.verified),
    JSON.stringify(retired)
  );
});

section("edits.ts - readCurationTally is bounded to today's own section", () => {
  const log = ["## 2026-09-10", "", "## 2026-09-08", "", "* **Curation**: human:ada confirmed 7, sent back 2, corrected 1, retired 0.", ""].join("\n");
  const today = readCurationTally(log, "2026-09-10", "ada");
  expect(
    "a line under an OLDER date is not read as today's running tally",
    JSON.stringify(today) === JSON.stringify({ confirmed: 0, sentBack: 0, corrected: 0, retired: 0 }),
    JSON.stringify(today)
  );
  const older = readCurationTally(log, "2026-09-08", "ada");
  expect("that day's own line is read back correctly", older.confirmed === 7 && older.sentBack === 2, JSON.stringify(older));
  expect("another curator's line is not read as mine", readCurationTally(log, "2026-09-08", "bob").confirmed === 0, "");
});

section("edits.ts - parseCurationTally round-trips upsertCurationLine's output", () => {
  const log = upsertCurationLine("", "2026-09-08", "ada", { confirmed: 4, sentBack: 1, corrected: 1, retired: 1 });
  const line = log.split("\n").find((l) => l.includes("**Curation**"))!;
  const parsed = parseCurationTally(line);
  expect("round-trips the four counts", JSON.stringify(parsed) === JSON.stringify({ confirmed: 4, sentBack: 1, corrected: 1, retired: 1 }), JSON.stringify(parsed));
  expect("unparseable line returns null", parseCurationTally("* not a curation line") === null, "");
});

section("edits.ts - repeated send-back hint", () => {
  const hint = repeatedSendBackHint(["the endpoint moved to v2", "the endpoint moved to v3 too", "unrelated note"]);
  expect("flags two notes sharing their first four words", hint !== null && hint.includes("2 similar send-backs"), String(hint));
  expect("no hint when nothing repeats", repeatedSendBackHint(["one thing", "another thing"]) === null, "");
});

// ---- trust-label.ts ----

section("trust-label.ts - the shared trust-tier vocabulary", () => {
  const label = (r: Pick<TrustRecord, "status" | "humanConfirmed" | "automationOnly">) => trustLabel(r);
  expect("a human-confirmed stable concept reads Confirmed", label({ status: "stable", humanConfirmed: true, automationOnly: false }).tone === "confirmed", "");
  expect("verified by automation only reads Automation", label({ status: "stable", humanConfirmed: false, automationOnly: true }).tone === "automation", "");
  expect("no verified key reads Unchecked", label({ status: "stable", humanConfirmed: false, automationOnly: false }).tone === "unchecked", "");
  expect("a draft reads Draft whatever its verified events", label({ status: "draft", humanConfirmed: true, automationOnly: false }).tone === "draft", "");
  expect("a deprecated concept reads Retired", label({ status: "deprecated", humanConfirmed: true, automationOnly: false }).tone === "retired", "");
  const confirmed = label({ status: "stable", humanConfirmed: true, automationOnly: false });
  expect("a label carries a short form, a sentence, and an icon", !!confirmed.short && !!confirmed.long && !!confirmed.icon, JSON.stringify(confirmed));
});

section("trust.ts - buildTrustRecord carries the handoff fields", () => {
  const rec = buildTrustRecord(
    {
      path: "c.md",
      bundleRoot: "",
      frontmatter: {
        type: "Reference",
        verified: [{ by: "human:alice", at: "2026-01-15" }],
        generated: { by: "process:lokf-librarian", at: "2026-01-01" },
      },
      headings: [],
      mintId: (p) => p,
    },
    TODAY
  );
  expect("confirmedBy is the human actor", rec.confirmedBy === "human:alice", String(rec.confirmedBy));
  expect("confirmedAt is normalized to a date", rec.confirmedAt === "2026-01-15", String(rec.confirmedAt));
  expect("generatedBy is the producer", rec.generatedBy === "process:lokf-librarian", String(rec.generatedBy));
});

section("trust-label.ts - the handoff hint (whose turn in the loop)", () => {
  type H = Parameters<typeof handoffLabel>[0];
  const base: H = {
    status: "stable",
    hasOpenQuestions: false,
    editedSinceConfirmed: false,
    pastReview: false,
    generatedBy: null,
    humanConfirmed: false,
    confirmedBy: null,
    confirmedAt: null,
    unchecked: true,
  };
  expect("open questions take priority - for the curator", handoffLabel({ ...base, hasOpenQuestions: true })?.kind === "open-questions", "");
  expect("edited since a confirmation is flagged", handoffLabel({ ...base, editedSinceConfirmed: true })?.kind === "edited-since", "");
  expect("past its review date is flagged", handoffLabel({ ...base, pastReview: true })?.kind === "past-review", "");
  expect("a librarian draft awaits a curator", handoffLabel({ ...base, status: "draft", unchecked: false, generatedBy: "process:lokf-librarian" })?.kind === "drafted", "");
  const c = handoffLabel({ ...base, unchecked: false, humanConfirmed: true, confirmedBy: "human:alice", confirmedAt: "2026-01-15" });
  expect("a confirmed concept names who and when", c?.kind === "confirmed" && c.text === "Confirmed by alice on 2026-01-15", JSON.stringify(c));
  expect("an unchecked concept is for the curator", handoffLabel(base)?.kind === "unchecked", "");
  expect("a retired concept has no handoff", handoffLabel({ ...base, status: "deprecated" }) === null, "");
});

section("suggest-context.ts - frontmatter completion detection", () => {
  expect("status completes the lifecycle values", kindForKey("status") === "status", "");
  expect("by completes the actor", kindForKey("by") === "actor", "");
  expect("at and stale_after complete a date", kindForKey("at") === "date" && kindForKey("stale_after") === "date", "");
  expect("an unrelated key completes nothing", kindForKey("title") === null, "");

  const lines = ["---", "type: Reference", "status: dr", "verified:", "  - by: hu", "    at: 2026", "---", "body"];
  const read = (i: number) => lines[i] ?? "";
  expect("inside the frontmatter fence", withinFrontmatter(read, lines.length, 2), "expected true");
  expect("the body is outside the fence", !withinFrontmatter(read, lines.length, 7), "expected false");
  const status = detectSuggestContext(read, 2, read(2).length);
  expect("status value is detected with its query", status?.kind === "status" && status.query === "dr", JSON.stringify(status));
  const by = detectSuggestContext(read, 4, read(4).length);
  expect("a `- by:` list item detects the actor", by?.kind === "actor" && by.query === "hu", JSON.stringify(by));
  const at = detectSuggestContext(read, 5, read(5).length);
  expect("a nested `at:` detects a date", at?.kind === "date" && at.query === "2026", JSON.stringify(at));
  expect("a non-completable line yields nothing", detectSuggestContext(read, 1, read(1).length) === null, "expected null");
});

section("field reference - schema-sourced, drift-guarded, modal-sized", () => {
  const byName = new Map(LOKF_FIELD_DOCS.map((f) => [f.name, f.description]));
  for (const key of ["lokf_version", "base_iri", "type", "id", "genre", "status", "verified", "relations"]) {
    expect(`documents ${key}`, byName.has(key), `missing ${key}`);
  }
  const baseIri = byName.get("base_iri") ?? "";
  expect("base_iri is framed as an identifier that need not resolve", /identifier/i.test(baseIri) && /need not resolve/i.test(baseIri), baseIri);
  expect("every field doc carries a non-empty description", LOKF_FIELD_DOCS.every((f) => f.description.trim().length > 0), "empty description");

  // The description flows straight from the schema manifest, unchanged.
  const resolved = resolveFieldDocs([{ name: "title", description: "STRAIGHT FROM THE SCHEMA" }]);
  expect("the schema's description flows through unchanged", resolved.find((f) => f.name === "title")?.description === "STRAIGHT FROM THE SCHEMA", "schema description not used");
  expect("a FIELD_ORDER field the manifest doesn't describe is dropped", resolved.length === 1, "undescribed fields not dropped");

  // Drift guard: every surfaced field is a real, described schema slot.
  const manifestSlots = new Set(((lokfVocab as { slots?: { name: string }[] }).slots ?? []).map((s) => s.name));
  expect(
    "every FIELD_ORDER entry is a real schema slot",
    LOKF_FIELD_DOCS.length === FIELD_ORDER.length && LOKF_FIELD_DOCS.every((f) => manifestSlots.has(f.name)),
    "a FIELD_ORDER entry names a slot the schema doesn't have"
  );

  // Conciseness guard: schema descriptions must stay short enough for a one-row lookup.
  const longest = Math.max(...LOKF_FIELD_DOCS.map((f) => f.description.length));
  expect("every field description stays modal-sized (<= 400 chars)", longest <= 400, `longest description is ${longest} chars`);
});

// ---- summary ----

if (failures > 0) {
  console.error(`\n${failures} failure(s).`);
  process.exit(1);
} else {
  console.log("\nAll checks passed.");
}
