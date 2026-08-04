---
"veridia": patch
---

Fix: delegate.ts — use execFileWithShim for Windows compat, fix error type assertion
Fix: session-do.ts — human-review mapped to correct OracleKind, use CHECK_TO_KIND map
Fix: triage.ts — remove clearSession before triage (was breaking session resume)
Fix: triage.ts — consolidate 3 writeSession calls into 1
Fix: split-command.ts — handle escaped quotes, tabs
Fix: exec-shim.ts — quote paths with spaces for Windows shell fallback, preserve stderr
Fix: checkbox-select.ts — add timeout + cleanup to prevent memory leak
Fix: shared.ts — remove dead parseFlags function
Fix: config.ts — add eslint.config.mjs to lint probes (sync with probe.ts)
