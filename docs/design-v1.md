# dsh-uigen V1 — design

> Decision-complete design, grounded in a source-level read of
> `@changfenhuang/dsh-genui@0.16.0` (tarball: SKILL.md spec, lib/index.js
> 8,345 lines). Companion to [plan-v1.md](plan-v1.md). Date: 2026-11-22.

## 1. Goal / non-goals

**Goal**: a deterministic **pre-flight composition gate** — `ui_compose`
lints the agent's draft `dsh-ui` JSON against the genui 0.16.0 spec
(type whitelist, per-type props, hard limits, answer-level layout
discipline) BEFORE the block is emitted; invalid drafts get repair
diagnostics (error blocks emit, warnings advise); valid drafts come back
as the exact fenced block. Plus the workflow skill and (V2) domain
composition presets.

**Non-goals**: a renderer (genui's job; tolerance rendering stays);
post-hoc feedback (genui already steers fence issues at
`agent/turn-stopping` — lib/index.js:7736, "fence feedback steering"
:7766 — we are the **before**, it is the **after**); new component TYPES
(see decision D1 — the whitelist is the renderer's contract, we extend by
composition, not by type).

## 2. Architecture

```
agent LLM
  │ (skill: draft → lint → fix → emit workflow; when-UI judgment)
  ▼
draft JSON ──▶ ui_compose(draft, lang)
                  │ R1 schema   (55 types, per-type props, enums, nesting)
                  │ R2 limits   (carousel ≤24 · map ≤50 & coord ranges · …)
                  │ R3 answer-layout discipline (≤1 display, ≤1 hero, …)
                  ├─ errors   → repair diagnostics [{path, rule, msg, fix}] → agent self-heals
                  └─ ok       → returns exact ```dsh-ui fenced block
                                      ▼
                        agent emits the block ──▶ dsh-genui renders inline
                                                (tolerance + its own post-hoc
                                                 steering = second line)
```

Two defense layers, complementary: we catch what tolerance would silently
degrade (limit violations, discipline breaches) before it ships; genui
catches stream-time issues after. Deterministic layer is our code;
intelligence stays the agent's; zero network calls.

## 3. Module layout (TypeScript, Node ≥ 22)

```
src/
  index.ts     plugin entry: ctx.tools.register(uiCompose), config schema
  catalog/     the pinned genui 0.16.0 spec, machine-encoded:
                 types.ts       55 types across 5 classes (layout/display/
                                charts/interactive/advanced) + per-type props
                 limits.ts      hard caps from SKILL.md usage rules
  rules/       lint engine:
                 r1-schema.ts   whitelist/props/enums/nesting
                 r2-limits.ts   numeric caps & ranges
                 r3-layout.ts   answer-level discipline (error+warn severities)
  compose.ts   tool contract: diagnostics formatting (EN/zh), block emission
  presets/     (V2) domain composition presets — parameterized patterns over
                 primitives (finance card = card+stat+echart composition)
tests/         hermetic fixtures from SKILL.md's own 范例/版式参考 sections
```

## 4. The catalog (pinned to genui 0.16.0)

Source of truth: genui's SKILL.md (420 lines) + block sources — extracted,
not invented. Five classes, ~55 types:

- **layout**: `text row col grid card carousel divider spacer arrow hero`
  (+ the `span` bento primitive; `hero`/`display` are one-per-answer)
- **display**: `stat badge progress list table keyvalue avatar image
  image-group compare audio video timeline file-tree breadcrumb diff json
  code callout steps icon blocks`
- **charts**: `chart` (bars/line/donut, multi-series) · `plot` (math) ·
  `echart` (full ECharts)
- **interactive**: `button input select checkbox radio switch slider
  textarea editor date-picker segmented-control tabs accordion copy link
  submit popover`
- **advanced**: `svg mermaid diagram scene3d quiz entity-card`

Hard limits encoded (from SKILL.md usage rules): carousel ≤24 items,
item width 80–640px and ≤85% track; map `locations` ≤50 with lon/lat
ranges and no-invented-places rule flagged as warning; `text.size:
"display"` ≤1 per answer; `hero` ≤1 per answer; alias hints (`columns` →
`cols`).

## 5. `ui_compose` tool contract

```js
ui_compose({ draft: <object>, lang?: "en"|"zh" })
  → { ok: true,  block: "```dsh-ui\n{…}\n```", warnings: [{path, rule, msg}] }
  |  { ok: false, errors:   [{path, rule, msg, fix}], warnings: [...] }
```

- **Errors block emission** (fail-closed: a draft with errors is never
  returned as a block); warnings pass through.
- Diagnostics cite `path` (JSONPath), `rule` id, a one-line message, and a
  concrete `fix` — repair prompts the agent can act on directly
  (self-heal loop, the family guard pattern).
- Deterministic: same draft → same verdict; zero network; ≤ a few ms for
  realistic sizes.
- If the agent emits a `dsh-ui` block WITHOUT calling the tool, nothing
  breaks — genui still renders it (our gate is advisory-by-workflow,
  enforced-by-skill, never a hard system block; see fail-closed matrix).

## 6. Skill (EN-first, `--lang zh` equivalent via diagnostics lang)

Teaches the **workflow**, not a duplicate of genui's spec: (1) when a UI is
part of the answer (genui SKILL.md's content-type→component mapping,
referenced not copied); (2) draft → `ui_compose` → fix → emit loop;
(3) answer-level discipline (default no-card, focus uniqueness, the
"not templated" check); (4) domain presets when V2 lands.

## 7. Config surface (cordis.patch.yml)

```yaml
- id: dsh-uigen
  config:
    genuiSpec: "0.16.0"      # rule-set pin; mismatch with installed genui → warn + best-effort
    strictness: errors-only  # errors-only | strict (warnings block too — for CI/demo)
    diagnosticsLang: en      # en | zh
```

## 8. Fail-closed matrix

| failure | behavior |
|---|---|
| tool throws (bug) | agent proceeds without lint; genui tolerance + steering remain — answer never blocked |
| draft uses unknown type/prop | error + fix suggestion ("closest whitelisted type…") |
| limit violation | error with the cap and the offending count |
| discipline breach (2× hero etc.) | error (hard caps) / warning (heuristic ones) |
| pinned spec ≠ installed genui | warn once per session; rules run best-effort |
| `strictness: strict` | warnings also block — demo/CI mode, never default |

## 9. Test plan

**Hermetic** (node:test): catalog conformance (every SKILL.md 范例 must
lint clean — the doc's own examples are the golden fixtures); each limit's
boundary (24/25 carousel, 50/51 map, 2× display); alias hint; diagnostics
shape; strictness modes; determinism. **Live smoke** (genui installed):
describe → draft → lint-clean → block → rendered inline (screen-recorded);
malformed draft → diagnostics → self-healed second draft → rendered.

## 10. Decisions register

| # | question | ruling | rationale |
|---|---|---|---|
| D1 | V2 domain packs = new types? | **no — composition presets over primitives** | the whitelist is the renderer's contract; unknown types break rendering; presets (card+stat+echart finance card) deliver domain value within contract; new types only enter at V3 with our own renderer |
| D2 | hard-block unlinted blocks? | no — advisory gate | a broken gate must never break answers; genui tolerance+steering is the second line; enforcement is workflow+skill |
| D3 | duplicate genui's SKILL.md teaching? | reference, don't copy | single source of truth stays upstream; we teach the workflow and pin the rules |
| D4 | spec pinning | rule set pinned `genuiSpec`, warn on mismatch | format drift protection without hard coupling |
| D5 | diagnostics language | EN default, zh opt-in | family rule |
| D6 | post-hoc feedback? | not ours — genui's `agent/turn-stopping` steering (:7736) already does after-the-fact | we are the before; complementary, zero overlap |

## 11. PR breakdown (issues on approval)

1. **PR1** catalog extraction (55 types + limits from genui 0.16.0 source)
   + R1/R2 lint engine + `ui_compose` tool + hermetic golden fixtures
2. **PR2** R3 discipline rules + skill (workflow, EN-first) + config
3. **PR3** live smoke (paired install with genui; record self-heal path) +
   install docs + npm `dsh-uigen` 0.1.0 train
