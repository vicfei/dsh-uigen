# ROADMAP — dsh-uigen

North star: complete "describe → component → rendered in the reply" on DSH
with local intelligence and deterministic validation — then make the spec
cross-harness (V3).

## S1 · Survey ✅ (2026-11-22)
dsh-ui = whitelist JSON component spec (genui SKILL.md, MIT, official DSH
closure 0 hits = third-party de-facto standard); Magic/21st cloud-lock
verified (v0.2.0+ thin HTTP proxy, AI generation by subscription); name
`dsh-uigen` locked (npm 0.0.1). → [docs/plan-v1.md](docs/plan-v1.md)

## V1 · Generation quality layer — **implementation merged 2026-11-22 (PR #2, 14 tests green)**; live smoke with genui + npm 0.1.0 remain open
- [ ] PR1 scaffold + catalog schema + `ui_compose` validator (fail-closed,
      repair diagnostics, self-heal loop; hermetic suites)
- [x] ~~PR2~~ (folded into PR1 series)
- [ ] PR3 live smoke with dsh-genui installed (describe → valid block →
      rendered inline; malformed-draft self-heal path recorded) + paired
      install docs + npm 0.1.0 train (owner publish) + awesome submission

## V2 · Domain packs
- [ ] Finance pack: candles, tearsheet fragments, factor tables, equity
      curves (vibe-trading SVG lineage migrates in)
- [ ] Ops pack (wrenai table outputs upgrade path)
- [ ] Catalog contribution API for third-party packs

## V3 · Cross-harness spec (format play — the VIDEO.md precedent)
- [ ] Elevate the JSON spec to a cross-harness interactive-component
      interchange; CC mini-renderer (artifacts/skills) + Codex
      (AGENTS.md + browser)

## Discipline
- No cloud generation APIs — local LLM + whitelist catalog is the moat.
- Fail-closed: invalid composition never reaches the renderer; diagnostics
  feed agent self-healing.
- Catalog pinned per genui spec version; CI drift tripwire; renderer fork
  kept as named fallback, not a default.
