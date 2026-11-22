// ui_compose contract (design §5): errors block emission, warnings pass;
// returns the exact fenced block on success. Deterministic, zero network.

import { lintAnswer } from "./rules.js";
import { GENUI_SPEC } from "./catalog.js";

// cordis plugin convention: wait for the tools service before apply() runs
export const inject = ["tools"];

export function compose(draft, { lang = "en", strictness = "errors-only" } = {}) {
  if (draft === null || typeof draft !== "object") {
    return { ok: false, errors: [{ path: "$", rule: "contract", severity: "error", msg: "draft must be an object or array of nodes", fix: "pass the composed dsh-ui node tree" }], warnings: [] };
  }
  const { errors, warnings } = lintAnswer(draft, { strictness });
  if (errors.length > 0) return { ok: false, errors, warnings };
  const json = JSON.stringify(draft, null, 2);
  return { ok: true, block: "```dsh-ui\n" + json + "\n```", warnings, spec: GENUI_SPEC };
}

// Plugin entry: registers the tool on a DSH host. The heavy lifting is the
// pure compose() above; this wiring is the only host-coupled surface
// (signature per dsh-tool-cordis precedent: defineTool from @deepseek-ai/dsh-tools).
export function apply(ctx, config = {}) {
  ctx.tools.register({
    name: "ui_compose",
    description:
      `Lint a drafted dsh-ui component tree against the genui ${GENUI_SPEC} whitelist BEFORE emitting it. ` +
      "Input: the draft node tree (object or array). Returns {ok, block} — emit the block verbatim in your reply — " +
      "or {ok:false, errors:[{path,rule,msg,fix}]} — fix each and call again. Never emit a dsh-ui block that has not passed this tool.",
    parameters: {
      draft: { type: "json", required: true, description: "the composed dsh-ui node tree" },
      lang: { type: "string", required: false, description: "diagnostics language: en (default) | zh" },
    },
    output: { schema: { type: "json" } },
    async execute({ draft, lang }, { signal }) {
      const result = compose(draft, { lang: lang || config.diagnosticsLang || "en", strictness: config.strictness || "errors-only" });
      if (signal?.aborted) return { ok: false, errors: [{ path: "$", rule: "aborted", severity: "error", msg: "aborted", fix: "retry" }], warnings: [] };
      return result;
    },
  });
  ctx.logger?.info?.(`dsh-uigen: ui_compose ready (genui spec pin ${GENUI_SPEC}, provider-off advisory gate)`);
}
