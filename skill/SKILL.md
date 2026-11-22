---
name: dsh-uigen
description: Compose dsh-ui inline components with a pre-flight lint — draft, call ui_compose, fix diagnostics, then emit the returned block verbatim. Keeps malformed UI from ever rendering broken.
---

Use this skill whenever part of the answer is better as an interactive UI
than as prose (data panels, comparisons, charts, forms, step flows).

## Workflow (the whole skill)

1. **Decide a UI is part of the answer** — the genui SKILL.md content-type →
   component mapping is the reference (do not duplicate it here). Default
   to prose; a UI earns its place when it shows structure the reader will
   act on (sort/filter/compare/see-at-a-glance).
2. **Draft** the component tree mentally or in scratch: pick from the
   whitelist (`text row col grid card carousel divider spacer arrow hero ·
   stat badge progress list table keyvalue avatar image image-group compare
   audio video timeline file-tree breadcrumb diff json code callout steps
   icon blocks · chart plot echart · button input select checkbox radio
   switch slider textarea editor date-picker segmented-control tabs
   accordion copy link submit popover · svg mermaid diagram scene3d quiz
   entity-card map`).
3. **Call `ui_compose` with the draft.** Never skip this step.
4. On `{ok:false}` — read every error's `fix`, apply, call again. Warnings
   are advice; fix them when cheap.
5. On `{ok:true}` — emit the returned `block` **verbatim** in the reply.
   Do not hand-edit the block after linting.

## Discipline

- One focus per answer: ≤1 `hero`, ≤1 `text.size:"display"` — both are
  hard errors in the linter, not style tips.
- `carousel` ≤ 24 items; `map` ≤ 50 locations with real coordinates —
  never invent places.
- Do not template: six sibling cards of the same type is a smell the
  linter flags — mix `stat`/`chart`/`keyvalue` structures instead.
- A failed lint is a feature: it means the renderer would have silently
  degraded your UI.
