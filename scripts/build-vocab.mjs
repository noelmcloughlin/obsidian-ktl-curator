// build-vocab.mjs - derive src/lokf-vocab.json from a pinned lokf.yaml.
//
// A maintenance step, not part of `npm run build`: it reads the LinkML schema
// the sidecar's pinned `lokf` toolkit ships (`.lokf/uv.lock` decides the
// version, and the package carries `lokf/data/lokf.yaml`) and writes the small
// JSON manifest the plugin ships as static data - so the manifest can never
// drift from what `just lokf-validate` checks a bundle against. The curator
// consumes the `slots` (each field's schema description) for its "Look up a
// LOKF field" reference (src/fields.ts); the rest of the manifest is kept in
// step with KTL Registrar. Re-run it, and commit the result, when bumping
// the pin.
//
//   node scripts/build-vocab.mjs                        # the pinned toolkit's schema
//   LOKF_SCHEMA=/path/to/lokf.yaml node scripts/build-vocab.mjs   # a schema under development
import { readFileSync, writeFileSync } from "node:fs";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";
import { load as loadYaml } from "js-yaml";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, "..");
const sidecar = join(repoRoot, ".lokf");

/** Run a command inside the sidecar's own environment (`uv run --project`),
 *  which resolves and installs the pinned toolkit on first use. */
function inSidecar(cmd) {
  return execSync(`uv run --project "${sidecar}" ${cmd}`, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  }).trim();
}

function pinnedSchemaPath() {
  try {
    return inSidecar(`python -c "from importlib.resources import files; print(files('lokf') / 'data' / 'lokf.yaml')"`);
  } catch (e) {
    // uv's own message (not installed, no network, a broken lock) is the
    // useful part, so it is passed through rather than paraphrased.
    console.error(String(e?.stderr ?? e?.message ?? e).trim());
    console.error("build-vocab: could not locate the pinned schema via `uv run --project .lokf`; install uv (https://docs.astral.sh/uv/) or set LOKF_SCHEMA.");
    process.exit(1);
  }
}

const schemaPath = process.env.LOKF_SCHEMA ? resolve(process.env.LOKF_SCHEMA) : pinnedSchemaPath();

const doc = loadYaml(readFileSync(schemaPath, "utf8"));
const classes = doc.classes ?? {};
const enums = doc.enums ?? {};

/** True when `name` reaches `ancestor` through the `is_a` chain, so Table
 *  (is_a Dataset is_a Concept) and Person (is_a Agent) both classify. */
function isDescendantOf(name, ancestor) {
  const seen = new Set();
  let cur = classes[name]?.is_a;
  while (cur && !seen.has(cur)) {
    if (cur === ancestor) return true;
    seen.add(cur);
    cur = classes[cur]?.is_a;
  }
  return false;
}

// The `type:` vocabulary: every non-abstract class that is a Concept (or an
// Agent - Person/Organization are valid concept types too). Declaration order
// is preserved, so the JSON reads in the same order as the schema.
const conceptTypes = [];
for (const [name, def] of Object.entries(classes)) {
  if (def?.abstract) continue;
  if (!isDescendantOf(name, "Concept") && !isDescendantOf(name, "Agent")) continue;
  const entry = { name };
  if (Array.isArray(def.aliases) && def.aliases.length) entry.aliases = def.aliases;
  conceptTypes.push(entry);
}

const relationTypes = Object.keys(enums.RelationType?.permissible_values ?? {});
const genres = Object.entries(enums.DiataxisMode?.permissible_values ?? {}).map(([value, def]) => {
  const g = { value };
  if (Array.isArray(def?.aliases) && def.aliases.length) g.aliases = def.aliases;
  const notes = Array.isArray(def?.notes) ? def.notes[0] : def?.notes;
  if (typeof notes === "string") g.notes = notes.trim();
  return g;
});

// Field descriptions for the plugin's "Look up a LOKF field" reference. Prefer
// the pinned toolkit's own `lokf vocab --all --json` export (a versioned contract);
// fall back to reading the slot descriptions straight from lokf.yaml when that
// CLI (or its --all flag) isn't installed yet - so a schema bump refreshes the
// field reference either way.
function slotsFromCli() {
  try {
    const out = inSidecar("lokf vocab --all --json");
    const rows = JSON.parse(out).slots;
    if (!Array.isArray(rows)) return null;
    const slots = rows
      .map((s) => ({ name: String(s?.name ?? ""), description: String(s?.description ?? "").trim() }))
      .filter((s) => s.name && s.description);
    return slots.length ? { slots, source: "lokf vocab --all --json" } : null;
  } catch {
    return null;
  }
}
function slotsFromSchema() {
  const slots = Object.entries(doc.slots ?? {})
    .map(([name, s]) => ({ name, description: String(s?.description ?? "").trim() }))
    .filter((s) => s.description);
  return { slots, source: "lokf.yaml" };
}
const fieldDocs = slotsFromCli() ?? slotsFromSchema();

const manifest = {
  schemaVersion: String(doc.version ?? ""),
  generatedFrom: "lokf.yaml",
  classes: conceptTypes,
  relationTypes,
  genres,
  fieldTypes: Object.keys(enums.FieldType?.permissible_values ?? {}),
  conceptStatuses: Object.keys(enums.ConceptStatus?.permissible_values ?? {}),
  subsets: Object.keys(doc.subsets ?? {}),
  slots: fieldDocs.slots,
};

const out = join(repoRoot, "src", "lokf-vocab.json");
writeFileSync(out, JSON.stringify(manifest, null, 2) + "\n");
console.log(
  `wrote ${out} from ${schemaPath}: schema ${manifest.schemaVersion}, ` +
    `${conceptTypes.length} classes, ${relationTypes.length} relation types, ${genres.length} genres, ` +
    `${fieldDocs.slots.length} field docs (via ${fieldDocs.source}).`
);
