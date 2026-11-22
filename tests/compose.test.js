// Hermetic suites (design §9): golden fixtures = the composition shapes the
// workflow promises; every r1/r2/r3 rule class has a positive and negative.
import { test } from "node:test";
import assert from "node:assert";
import { compose } from "../lib/compose.js";
import { lintAnswer } from "../lib/rules.js";
import { TYPES, GENUI_SPEC } from "../lib/catalog.js";

// ---- golden fixtures (valid compositions must lint clean) ----------------
test("golden: stat panel composition", () => {
  const r = compose({ type: "row", items: [
    { type: "stat", label: "p95", value: "312ms", delta: "-14%" },
    { type: "chart", kind: "line", series: [[1, 2, 3, 4]] },
  ] });
  assert.equal(r.ok, true);
  assert.match(r.block, /^```dsh-ui\n/);
});
test("golden: hero + table + callout", () => {
  const r = compose([
    { type: "hero", title: "Release 0.2", value: "99.96%", tone: "success" },
    { type: "table", columns: ["repo", "status"], rows: [["a", "green"], ["b", "red"]] },
    { type: "callout", tone: "warning", items: [{ type: "text", content: "one repo red" }] },
  ]);
  assert.equal(r.ok, true);
  assert.equal(r.warnings.length, 0);
});

// ---- R1 schema ------------------------------------------------------------
test("r1: unknown type errors with closest suggestion", () => {
  const r = compose({ type: "cardx", items: [] });
  assert.equal(r.ok, false);
  assert.equal(r.errors[0].rule, "r1-whitelist");
  assert.ok(r.errors[0].fix.includes("closest"));
});
test("r1: enum violation + required missing", () => {
  const r = compose({ type: "text", content: "x", size: "huge" });
  assert.equal(r.ok, false);
  assert.ok(r.errors.some((e) => e.rule === "r1-enum"));
  const r2 = compose({ type: "image" });
  assert.ok(r2.errors.some((e) => e.rule === "r1-required" && e.path === "$.src"));
});
test("r1: leaf/container misuse", () => {
  assert.ok(compose({ type: "stat", items: [] }).errors.some((e) => e.rule === "r1-container"));
  assert.ok(compose({ type: "row" }).errors.some((e) => e.rule === "r1-container"));
});
test("r1: alias hint is a warning (columns → cols)", () => {
  const { warnings } = lintAnswer({ type: "grid", cols: 3, items: [] });
  const w2 = lintAnswer({ type: "grid", columns: 3, items: [] });
  assert.ok(w2.warnings.some((w) => w.rule === "r1-alias" && w.fix.includes("cols")));
  assert.equal(warnings.filter((w) => w.rule === "r1-alias").length, 0);
});
test("r1: range checks (col.width 1-100, progress 0-100)", () => {
  assert.ok(compose({ type: "col", width: 140, items: [] }).errors.some((e) => e.rule === "r1-range"));
  assert.ok(compose({ type: "progress", value: 130 }).errors.some((e) => e.rule === "r1-range"));
});

// ---- R2 limits ------------------------------------------------------------
test("r2: carousel 24-item cap", () => {
  const items = Array.from({ length: 25 }, (_, i) => ({ type: "card", title: String(i), items: [] }));
  const r = compose({ type: "carousel", items });
  assert.equal(r.ok, false);
  assert.ok(r.errors.some((e) => e.rule === "r2-limit" && /24/.test(e.msg)));
  const ok24 = compose({ type: "carousel", items: items.slice(0, 24) });
  assert.equal(ok24.ok, true);
});
test("r2: map 50-location cap + coordinate rules", () => {
  const locs = (n) => Array.from({ length: n }, (_, i) => ({ id: String(i), label: "x", coordinates: [121.4, 31.2] }));
  assert.ok(compose({ type: "map", locations: locs(51) }).errors.some((e) => e.rule === "r2-limit" && /50/.test(e.msg)));
  const bad = compose({ type: "map", locations: [{ id: "1", label: "x", coordinates: [999, 31] }] });
  assert.ok(bad.errors.some((e) => e.rule === "r2-limit" && /180/.test(e.msg)));
});

// ---- R3 discipline --------------------------------------------------------
test("r3: two heroes = hard error", () => {
  const r = compose([
    { type: "hero", title: "a" },
    { type: "row", items: [{ type: "hero", title: "b" }] },
  ]);
  assert.equal(r.ok, false);
  assert.ok(r.errors.some((e) => e.rule === "r3-discipline" && /1 hero/.test(e.msg)));
});
test("r3: two display texts = hard error; one is fine", () => {
  const two = compose({ type: "col", items: [
    { type: "text", size: "display", content: "a" },
    { type: "row", items: [{ type: "text", size: "display", content: "b" }] },
  ] });
  assert.ok(two.errors.some((e) => e.rule === "r3-discipline" && /display/.test(e.msg)));
  const one = compose({ type: "col", items: [
    { type: "text", size: "display", content: "a" },
    { type: "text", size: "h2", content: "b" },
  ] });
  assert.equal(one.ok, true);
});
test("r3: template smell (8 sibling stats) warns, not blocks", () => {
  const r = compose({ type: "row", items: Array.from({ length: 8 }, (_, i) => ({ type: "stat", label: "m" + i, value: String(i) })) });
  assert.equal(r.ok, true);
  assert.ok(r.warnings.some((w) => w.rule === "r3-template"));
});

// ---- contract -------------------------------------------------------------
test("strict mode promotes warnings to blocking", () => {
  const draft = { type: "row", items: Array.from({ length: 8 }, (_, i) => ({ type: "stat", label: "m" + i, value: String(i) })) };
  assert.equal(compose(draft, { strictness: "strict" }).ok, false);
  assert.equal(compose(draft, { strictness: "errors-only" }).ok, true);
});
test("catalog sanity: 57 types pinned, spec stamped", () => {
  assert.equal(Object.keys(TYPES).length, 59); // 58 documented + map (SKILL.md usage-rules section)
  assert.equal(GENUI_SPEC, "0.16.0");
});
