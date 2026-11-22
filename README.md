# dsh-uigen — generate-and-render inline UI components for DeepSeek Harness

**Describe it, get a component, see it in the reply.** The agent's own LLM
composes UI against a **whitelisted component catalog** (the `dsh-ui` JSON
spec), composition is **schema-validated fail-closed** (malformed blocks
never reach the renderer — the agent gets repair diagnostics and self-heals),
and `dsh-genui` renders the result inline in the conversation. No cloud
generation API — fully local, intranet-friendly.

The missing layer atop two proven demands: describe→component
(Magic/21st, 14k/wk — cloud-locked) and components-in-replies on DSH
(dsh-genui, 9.9k/wk — render surface only). dsh-uigen completes the loop
with the generation quality neither has. Full plan:
[docs/plan-v1.md](docs/plan-v1.md).

## Status

S1 survey complete
> **Agent self-install** — paste this into your DeepSeek Harness agent:
> `Install dsh-uigen from https://github.com/vicfei/dsh-uigen into this profile: run \`dsh plugin --profile <name> add dsh-uigen\` AND add "dsh-uigen" to the profile's dsh.profile.bundles list, then verify the ui_compose tool answers.`; V1 in planning — see [ROADMAP.md](ROADMAP.md).

Not affiliated with DeepSeek, 21st.dev, or dsh-genui. MIT.
