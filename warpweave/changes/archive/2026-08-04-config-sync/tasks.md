## Context

See `proposal.md`. Three config files are out of sync with the codebase.

## Decisions

All changes are editorial/config fixes. No architectural decisions needed.

## Tasks

- [x] 1.1 Fix `.veridia/config.json` — change `models` (plural map) to `model` (single object)
- [x] 1.2 Fix `warpweave/config.yaml` — remove `tessl_registry` reference
- [x] 1.3 Fix `.env.example` — remove warpweave/RTK/superpowers env vars, keep only `VERIDIA_API_KEY`
