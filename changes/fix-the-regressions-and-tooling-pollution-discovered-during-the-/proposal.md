# Proposal — fix-the-regressions-and-tooling-pollution-discovered-during-the-

**Goal:** Fix the regressions and tooling pollution discovered during the audit of the veridia CLI/MCP codebase: (1) restore the accidentally removed cli.parse() call in src/cli/index.ts with proper error handling (already hand-fixed — add a regression test so it cannot recur), (2) fix the malformed indentation of the veridia_measure record block in src/mcp/index.ts (already hand-fixed), (3) remove the ~196 untracked .scaled.ts/.scaled.scaled.ts junk files in src/ plus the broken src/tasks/ and tests/ scaffold files that break pnpm lint and tsc --noEmit (CI is red), and add gitignore coverage so the tooling never re-pollutes the tree, (4) complete the MCP feedback loop: veridia_session_do must write its result into measure/history, and veridia_session_archive must actually archive the session into history instead of only clearing it. Deliverable: green CI (lint + typecheck + tests), clean repo tree, and MCP session lifecycle that records outcomes.

- Platform: Node.js CLI + MCP (veridia)
- Constraints: none
- Budget: moderate
- **Lessons applied (v0.12):** dashboard-live-metrics:shield:7cef6af26c09, first-run-orion-draft-forge-shield-orion:shield:6de650a0dba7, first-run-orion-draft-forge-shield-orion:shield:e0d43c3dfae5, first-run-orion-draft-forge-shield-orion:forge:e09f177aee62, find-bugs-and-improvement-suggestions-for-project-veridia:shield:940297ea1d5f
