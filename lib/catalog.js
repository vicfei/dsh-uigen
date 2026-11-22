// Catalog — the genui 0.16.0 whitelist, machine-encoded (design §4).
// Source: genui SKILL.md extraction (dsh-genui@0.16.0 tarball, 2026-11-22).
// Pin: genuiSpec "0.16.0". Unknown TYPE is an error; unknown PROP is a
// warning (our catalog is a pin of the documented surface, upstream may
// accept more — warnings keep us honest without false blocks).

export const GENUI_SPEC = "0.16.0";

export const TYPES = {
  // layout (containers need items; leaves reject items)
  text: { cls: "layout", leaf: true, props: { size: ["display", "h1", "h2", "h3", "body", "muted", "caption"], tone: ["danger", "success", "warning", "info", "muted"], align: ["left", "center", "right"], mono: "bool", content: "string" }, required: ["content"] },
  row: { cls: "layout", container: true, props: { wrap: "bool", spacer: "bool", gap: "number", justify: ["center"] } },
  col: { cls: "layout", container: true, props: { wrap: "bool", spacer: "bool", gap: "number", width: { kind: "number", min: 1, max: 100 } } },
  grid: { cls: "layout", container: true, props: { cols: { kind: "number", min: 1, max: 12 }, columns: "alias:cols" }, required: ["cols"] },
  card: { cls: "layout", container: true, props: { title: "string" } },
  carousel: { cls: "layout", container: true, props: { title: "string", itemWidth: { kind: "number", min: 80, max: 640 }, gap: "number" }, limits: { items: 24 } },
  divider: { cls: "layout", leaf: true, props: {} },
  spacer: { cls: "layout", leaf: true, props: {} },
  arrow: { cls: "layout", leaf: true, props: {} },
  hero: { cls: "layout", leaf: true, props: { title: "string", subtitle: "string", value: "string", label: "string", delta: "string", spark: "array", tone: ["accent", "success", "warning", "danger"] }, required: ["title"], perAnswer: 1 },
  // display
  stat: { cls: "display", leaf: true, props: { label: "string", value: "string", delta: "string" } },
  badge: { cls: "display", leaf: true, props: { text: "string", tone: "string" }, required: ["text"] },
  progress: { cls: "display", leaf: true, props: { value: { kind: "number", min: 0, max: 100 } }, required: ["value"] },
  list: { cls: "display", container: true, props: {} },
  table: { cls: "display", leaf: true, props: { columns: "array", rows: "array" }, required: ["columns", "rows"] },
  keyvalue: { cls: "display", leaf: true, props: { entries: "array" }, required: ["entries"] },
  avatar: { cls: "display", leaf: true, props: { src: "string", name: "string" } },
  image: { cls: "display", leaf: true, props: { src: "string", alt: "string" }, required: ["src"] },
  "image-group": { cls: "display", container: true, props: {} },
  compare: { cls: "display", container: true, props: {} },
  audio: { cls: "display", leaf: true, props: { src: "string" }, required: ["src"] },
  video: { cls: "display", leaf: true, props: { src: "string" }, required: ["src"] },
  timeline: { cls: "display", container: true, props: {} },
  "file-tree": { cls: "display", leaf: true, props: { tree: "array" }, required: ["tree"] },
  breadcrumb: { cls: "display", leaf: true, props: { items: "array" }, required: ["items"] },
  diff: { cls: "display", leaf: true, props: { before: "string", after: "string", language: "string" }, required: ["before", "after"] },
  json: { cls: "display", leaf: true, props: { value: "any" }, required: ["value"] },
  code: { cls: "display", leaf: true, props: { code: "string", language: "string" }, required: ["code"] },
  callout: { cls: "display", container: true, props: { tone: ["info", "warning", "danger", "success"] } },
  steps: { cls: "display", container: true, props: {} },
  icon: { cls: "display", leaf: true, props: { name: "string" }, required: ["name"] },
  blocks: { cls: "display", container: true, props: {} },
  // charts
  chart: { cls: "charts", leaf: true, props: { kind: ["bars", "line", "donut"], series: "array", labels: "array" }, required: ["series"] },
  plot: { cls: "charts", leaf: true, props: { fn: "string", domain: "array" }, required: ["fn"] },
  echart: { cls: "charts", leaf: true, props: { option: "object" }, required: ["option"] },
  // interactive
  button: { cls: "interactive", leaf: true, props: { label: "string", action: "string" }, required: ["label"] },
  input: { cls: "interactive", leaf: true, props: { id: "string", label: "string", placeholder: "string" }, required: ["id"] },
  select: { cls: "interactive", leaf: true, props: { id: "string", options: "array" }, required: ["id", "options"] },
  checkbox: { cls: "interactive", leaf: true, props: { id: "string", label: "string" }, required: ["id"] },
  radio: { cls: "interactive", leaf: true, props: { id: "string", options: "array" }, required: ["id", "options"] },
  switch: { cls: "interactive", leaf: true, props: { id: "string", label: "string" }, required: ["id"] },
  slider: { cls: "interactive", leaf: true, props: { id: "string", min: "number", max: "number", value: "number" }, required: ["id"] },
  textarea: { cls: "interactive", leaf: true, props: { id: "string", placeholder: "string" }, required: ["id"] },
  editor: { cls: "interactive", leaf: true, props: { id: "string", language: "string", value: "string" }, required: ["id"] },
  "date-picker": { cls: "interactive", leaf: true, props: { id: "string" }, required: ["id"] },
  "segmented-control": { cls: "interactive", leaf: true, props: { id: "string", options: "array" }, required: ["id", "options"] },
  tabs: { cls: "interactive", container: true, props: {} },
  accordion: { cls: "interactive", container: true, props: {} },
  copy: { cls: "interactive", leaf: true, props: { text: "string" }, required: ["text"] },
  link: { cls: "interactive", leaf: true, props: { text: "string", href: "string" }, required: ["text", "href"] },
  submit: { cls: "interactive", leaf: true, props: { label: "string", fields: "array" }, required: ["label"] },
  popover: { cls: "interactive", container: true, props: {} },
  // advanced
  svg: { cls: "advanced", leaf: true, props: { markup: "string" }, required: ["markup"] },
  mermaid: { cls: "advanced", leaf: true, props: { diagram: "string" }, required: ["diagram"] },
  diagram: { cls: "advanced", leaf: true, props: { nodes: "array", edges: "array" }, required: ["nodes", "edges"] },
  scene3d: { cls: "advanced", leaf: true, props: {} },
  quiz: { cls: "advanced", container: true, props: {} },
  "entity-card": { cls: "advanced", leaf: true, props: {} },
  // documented in SKILL.md usage rules (not in the headline list — kept with a note)
  map: { cls: "advanced", leaf: true, props: { locations: "array" }, required: ["locations"], limits: { "locations.length": { min: 1, max: 50 } } },
};

// answer-level discipline (design §4 pins / R3)
export const ANSWER_RULES = {
  maxPerAnswer: { text: (node) => node.size === "display" ? 1 : null, hero: 1 },
  spanNote: "grid children may set span:2..cols (bento primitive)",
};
