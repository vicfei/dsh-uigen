# dsh-uigen — plan (V1, founded 2026-11-22)

> Product ① of the frontend-ecosystem port verdicts
> ([gap-radar §F](https://github.com/vicfei/dsh-gap-radar/blob/main/docs/frontend-design-ecosystem-2026-11.md)):
> the **generate-and-render inline component** convergence — the only thesis
> where a CC-proven demand lands on a DSH-proven surface. Selected by owner
> 2026-11-22 under the mass-pain ruling.

## 1. Positioning (one line)

**The generation-quality layer that completes "describe → component →
rendered in the reply" on DSH**: the agent's own local LLM composes UI
against a **whitelisted component catalog** (the `dsh-ui` JSON spec),
generation is **schema-validated fail-closed** (malformed blocks never reach
the renderer), and rendering rides `dsh-genui` (MIT, 9,930/wk). No cloud
generation API — the decisive contrast with Magic/21st.

## 2. Thesis evidence (all measured 2026-11-22)

| signal | number | meaning |
|---|---|---|
| describe→component demand | `@21st-dev/magic` **14,166/wk** | …but v0.2.0+ is a thin proxy to 21st.dev HTTP MCP: API key + hosted AI subscription; without subscription only search+adapt — **cloud-locked by design** |
| components-in-replies demand (DSH) | `@changfenhuang/dsh-genui` **9,930/wk** | `dsh-ui` fenced blocks = whitelist-constrained JSON component spec, taught by its SKILL.md; panels/charts/forms/AV/function-plots/Mermaid/3D/layouts |
| official posture | 0 hits for `dsh-ui` in the DSH closure | `dsh-ui` is a third-party de-facto standard (genui 0.16.0, active, omdsh-dev org; MIT forks exist incl. renderer-swappable dsh-render) |
| cross-harness gap | CC Artifacts = product-bound; Codex = empty | only DSH can complete the loop as a plugin |

**Family advantage**: our guard/fail-closed engineering DNA is exactly what
the generation step lacks today (agents emit malformed JSON → broken
renders); and V2 domain catalogs are where family expertise is
unmatched (quant/ops).

## 3. Product layers

- **V1 — generation quality layer (DSH)**: plugin shipping (a) a
  `ui_compose` tool — validates the agent's composed `dsh-ui` JSON against
  the catalog schema, rejects with repair diagnostics on mismatch (self-heal
  loop, family guard style), returns the exact fenced block on success;
  (b) an **extended catalog** (genui whitelist superset: enhanced tables,
  chart series, base finance cards); (c) a skill (EN-first) teaching
  when a UI is part of the answer and the layout-composition rules.
  Rendering = declared dependency on `dsh-genui` (compatible-with, not
  forked; a renderer fork is the fallback insurance).
- **V2 — domain component packs**: family-depth catalogs — quant cards
  (candles, tearsheet fragments, factor tables, equity curves), ops panels;
  vibe-trading's SVG cards migrate in as the first pack.
- **V3 — cross-harness spec play** (the VIDEO.md precedent): elevate the
  JSON spec to a cross-harness interactive-component interchange — small
  renderers for CC (via artifacts/skills) and Codex (AGENTS.md + browser) —
  the spec becomes the product.

## 4. V1 architecture

```
agent LLM ──(skill: when + composition rules)──▶ ui_compose(draft JSON)
                                                      │ schema-validate against catalog
                                                      ├─ invalid → diagnostics → agent self-heals
                                                      └─ valid → ```dsh-ui fenced block
                                                                      │
dsh-genui renders it inline in the reply ◀───────────────────────────┘
```

- Deterministic layer (tool + schema) is our code; intelligence stays the
  agent's; rendering is a dependency. Zero network calls of our own —
  fully local, intranet-friendly (family rule).
- Catalog versioned and pinned against the genui spec version it targets;
  compatibility tests in CI against installed genui (format-drift tripwire).

## 5. V1 scope decisions

| decision | ruling | rationale |
|---|---|---|
| own renderer? | no — depend on dsh-genui | 9.9k/wk proof, MIT; renderer forks exist as insurance; our value is upstream |
| cloud generation (21st-style)? | never | cloud-lock is the incumbent's weakness, not a feature; local LLM + whitelist is the moat |
| validation posture | fail-closed with repair diagnostics | broken renders are the visible pain; guard DNA; self-heal loop precedent |
| catalog v0 | genui superset (~+8 components) | immediate visible value beyond the stock spec |
| skill language | EN-first (zh fallback) | family rule |
| name | `dsh-uigen` (npm AVAILABLE, 0.0.1 locked) | uigen = UI generation; short, unclaimed |

## 6. Risks

1. **genui is an active third party, not official** — format drift risk →
   catalog pinned per genui version + CI drift tripwire; fallback = renderer
   fork (dsh-render precedent).
2. **DSH could ship an official inline-UI surface** — then rendering
   commoditizes; our layers (generation quality, validation, domain packs)
   survive a renderer swap by design.
3. **Whitelist vs expressiveness tension** — V2 domain packs carry depth;
   the whitelist is the safety model, not a ceiling (catalog is extensible
   by us and by users).
4. Adoption dependency: users must install genui too → install docs make
   the pair explicit; long-term V3 decouples.

## 7. Milestones

- **S1 survey** ✅ (this plan): dsh-ui spec verified (whitelist JSON, MIT,
  SKILL.md public, official closure 0 hits); magic/21st cloud-lock verified;
  name locked.
- **V1.0** (issue→PR per family discipline):
  PR1 scaffold + catalog schema + `ui_compose` validator (hermetic suites)
  · PR2 extended catalog + skill (composition rules, EN-first)
  · PR3 live smoke with genui installed (real session: describe → valid
  block → rendered; malformed-draft self-heal path) + install docs
  · npm `dsh-uigen` 0.1.0 (owner publish) + awesome submission.
- **V2.0**: finance pack (vibe-trading SVG lineage), ops pack; catalog
  contribution API for third parties.
- **V3.0**: cross-harness spec + CC/Codex mini-renderers (format play).
