// Lint engine — R1 schema / R2 limits / R3 answer discipline (design §4-5).
// Errors block emission; warnings pass through (strict mode promotes).
// Diagnostics: {path, rule, severity, msg, fix} — teach-first.

import { TYPES, GENUI_SPEC, ANSWER_RULES } from "./catalog.js";

function diag(path, rule, severity, msg, fix) { return { path, rule, severity, msg, fix }; }
const kind = (v) => Array.isArray(v) ? "array" : v === null ? "null" : typeof v;

function checkValue(path, decl, value, out) {
  if (typeof decl === "string" && decl.startsWith("alias:")) return; // alias handled as warning at prop level
  if (Array.isArray(decl)) {
    if (!decl.includes(value)) out.push(diag(path, "r1-enum", "error", `value must be one of ${decl.join("|")}`, `use one of: ${decl.join(", ")}`));
    return;
  }
  if (typeof decl === "object" && decl.kind === "number") {
    if (kind(value) !== "number") out.push(diag(path, "r1-type", "error", `must be a number`, "convert to number"));
    else {
      if (decl.min !== undefined && value < decl.min) out.push(diag(path, "r1-range", "error", `must be >= ${decl.min}`, `raise to at least ${decl.min}`));
      if (decl.max !== undefined && value > decl.max) out.push(diag(path, "r1-range", "error", `must be <= ${decl.max}`, `lower to at most ${decl.max}`));
    }
    return;
  }
  const want = decl; // "string" | "number" | "bool" | "array" | "object" | "any"
  if (want === "any") return;
  if (want === "bool" && kind(value) !== "boolean") out.push(diag(path, "r1-type", "error", "must be boolean", "use true/false"));
  else if (want !== "bool" && kind(value) !== want) out.push(diag(path, "r1-type", "error", `must be ${want}, got ${kind(value)}`, `pass a ${want}`));
}

export function lintNode(node, path, ctx, out) {
  if (kind(node) !== "object" || !node.type) {
    out.push(diag(path, "r1-shape", "error", "every node must be an object with a `type`", "add type from the catalog"));
    return;
  }
  const spec = TYPES[node.type];
  if (!spec) {
    const near = Object.keys(TYPES).filter((t) => t.startsWith(node.type[0]) || node.type.startsWith(t)).slice(0, 3);
    out.push(diag(`${path}.type`, "r1-whitelist", "error", `unknown type "${node.type}" (genui ${GENUI_SPEC} whitelist)`, `closest whitelisted: ${near.join(", ") || "see catalog"}`));
    return;
  }
  ctx.counts[node.type] = (ctx.counts[node.type] || 0) + 1;
  if (spec.leaf && "items" in node) out.push(diag(`${path}.items`, "r1-container", "error", `${node.type} is a leaf — no items`, "remove items or use a container type (row/col/grid/card)"));
  if (spec.container && !Array.isArray(node.items)) out.push(diag(`${path}.items`, "r1-container", "error", `${node.type} requires items: [...]`, "wrap children in items array"));
  for (const req of spec.required || []) {
    if (!(req in node)) out.push(diag(`${path}.${req}`, "r1-required", "error", `${node.type} requires \`${req}\``, `add ${req}`));
  }
  for (const [k, v] of Object.entries(node)) {
    if (["type", "items", "span"].includes(k)) continue;
    const decl = spec.props?.[k];
    if (k === "span") continue;
    if (!decl) { out.push(diag(`${path}.${k}`, "r1-prop", "warning", `property "${k}" not in our ${node.type} catalog pin (may still render)`, `drop it if unneeded; catalog pin = genui ${GENUI_SPEC}`)); continue; }
    if (typeof decl === "string" && decl.startsWith("alias:")) {
      out.push(diag(`${path}.${k}`, "r1-alias", "warning", `"${k}" is an alias — use "${decl.slice(6)}"`, `rename to ${decl.slice(6)}`));
      continue;
    }
    checkValue(`${path}.${k}`, decl, v, out);
  }
  // R2 per-type limits
  if (spec.limits?.items && Array.isArray(node.items) && node.items.length > spec.limits.items)
    out.push(diag(`${path}.items`, "r2-limit", "error", `carousel allows at most ${spec.limits.items} items, got ${node.items.length}`, `keep the ${spec.limits.items} most relevant; drop ${node.items.length - spec.limits.items}`));
  if (spec.limits?.["locations.length"] && Array.isArray(node.locations)) {
    const L = spec.limits["locations.length"];
    if (node.locations.length > L.max) out.push(diag(`${path}.locations`, "r2-limit", "error", `map allows at most ${L.max} locations, got ${node.locations.length}`, `keep <= ${L.max}; never invent coordinates`));
    node.locations.forEach((loc, i) => {
      const c = loc?.coordinates;
      if (!Array.isArray(c) || c.length !== 2 || !c.every(Number.isFinite))
        out.push(diag(`${path}.locations[${i}].coordinates`, "r2-limit", "error", "coordinates must be [lon, lat], finite", "look up real coordinates; never guess"));
      else if (c[0] < -180 || c[0] > 180 || c[1] < -90 || c[1] > 90)
        out.push(diag(`${path}.locations[${i}].coordinates`, "r2-limit", "error", "lon ∈ [-180,180], lat ∈ [-90,90]", "fix the order/range"));
    });
  }
  if (typeof node.span === "number" && (node.span < 1 || node.span > 6))
    out.push(diag(`${path}.span`, "r2-limit", "warning", "span is a bento primitive (typically 2)", "keep span small; grid cols is the real control"));
  // recurse
  if (Array.isArray(node.items)) node.items.forEach((child, i) => lintNode(child, `${path}.items[${i}]`, ctx, out));
}

export function lintAnswer(draft, { strictness = "errors-only" } = {}) {
  const out = [];
  const ctx = { counts: {} };
  const root = Array.isArray(draft) ? { type: "col", items: draft } : draft;
  lintNode(root, "$", ctx, out);
  // R3: answer-level discipline
  const heroCount = ctx.counts.hero || 0;
  if (heroCount > (ANSWER_RULES.maxPerAnswer.hero || 1))
    out.push(diag("$.hero", "r3-discipline", "error", `at most 1 hero per answer, found ${heroCount}`, "keep the strongest hero; hero is the single visual anchor"));
  if ((ctx.counts.text || 0) > 0) {
    // display-size texts counted during walk: re-walk quickly
    let displays = 0;
    (function walk(n) {
      if (n?.type === "text" && n.size === "display") displays++;
      (n?.items || []).forEach(walk);
      if (Array.isArray(n)) n.forEach(walk);
    })(root);
    if (displays > 1) out.push(diag("$.text", "r3-discipline", "error", `at most 1 text.size:"display" per answer, found ${displays}`, "display is the opening thesis line — one only"));
  }
  // template smell: same leaf type repeated as direct siblings many times
  (function smell(n, path) {
    if (Array.isArray(n?.items) && n.items.length >= 6) {
      const byType = {};
      n.items.forEach((c) => { if (c?.type) byType[c.type] = (byType[c.type] || 0) + 1; });
      for (const [t, c] of Object.entries(byType)) {
        if (c >= 6 && TYPES[t]?.cls === "display")
          out.push(diag(path, "r3-template", "warning", `${c} sibling ${t} nodes — looks templated`, "vary structure: stat+chart+keyvalue mix beats a wall of cards"));
      }
    }
    (n?.items || []).forEach((c, i) => smell(c, `${path}.items[${i}]`));
  })(root, "$");

  const errors = strictness === "strict" ? out : out.filter((d) => d.severity === "error");
  const warnings = out.filter((d) => d.severity === "warning");
  return { errors, warnings, counts: ctx.counts };
}
