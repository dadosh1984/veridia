# veridia

**Model-agnostic quality through mechanics, not through the model.**

veridia is a personal "know-how" project. It is **not** a fork of warpweave/OpenSpec
(we keep the *method*, we rebuild the *code* from scratch). The core thesis:

> Quality comes from the process (triage + verifiable steps + self-measurement),
> not from which model you happen to plug in. veridia classifies a task, decides
> what can actually be verified, runs the cheapest sufficient model over it, and
> measures its own misses so it stops guessing blindly next time.

## The one-word identity: **triage**

veridia does not "understand you." It *sorts well*:
task → verifiability → process → model → check.

## Docs index

- [Philosophy](docs/philosophy.md) — the why and the core thesis.
- [Mechanics](docs/mechanics.md) — the five mechanisms, the heart of the product.
- [Verifiability (the crux)](docs/verifiability.md) — how we decide, mechanically,
  whether a task can be verified (this is the deepest design problem we have).
- [Roadmap](docs/roadmap.md) — how we eat the elephant piece by piece.
- [Naming](docs/naming.md) — why "veridia" and what is reserved.
- [Reuse](docs/reuse.md) — what we copy / rewrite / skip from warpweave (the "not a fork" line).

## Status

Exploration/design phase. Nothing implemented yet.
