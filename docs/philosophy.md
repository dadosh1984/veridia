# Philosophy

## Origin question

We started by asking whether the warpweave project was worth developing further.
Answer: as an open-source *product* seeking adoption — near zero chance (0 stars,
0 dependents, a fork of a 1.27M-download original). But as a *method + skills*
core it has real value. So: **keep the method, drop the fork, rebuild from zero.**

## Core thesis

> Quality is a property of the **process**, not of the **model**.
> A cheap/weak model + strong orchestration can reach the level of an expensive
> model on *verifiable* tasks — because we replace "one big smart jump" with
> "many small checkable steps."

## The unifying idea: triage over magic

We deliberately reject "the product intuitively understands the user." That framing
sets expectations that cannot be met. Honest version:

- veridia **classifies** the task (code fix? refactor? doc? open writing?).
- veridia **assesses** what can be verified.
- veridia **routes** to the cheapest model that suffices, choosing orchestration depth.
- veridia **asks** a couple of short questions when it honestly cannot be sure.
- veridia **measures** whether it guessed right, and learns from its own misses.

"Intuition" = good triage + honest model of uncertainty + self-check, **not** mind-reading.

## Hard boundary (a line we must never cross)

```
Intuition decides the PROCESS. It does NOT create JUDGMENT.

Verifiable tasks:   intuition + verifier  → lifts a weak model     ✓
Unverifiable tasks: intuition sees there's nothing to check,
                    but no process closes a missing-judgment gap  ✗  (floor)
```

There is a floor below which orchestration compounds noise instead of lifting
quality. We never promise "any model → great result on any task."

## Deliberately NOT a fork

- We keep: the method (spec-gate → TDD → minimalism), the skills ideas
  (drift, token-budget, learn), the domain understanding.
- We drop: the OpenSpec-derived CLI, the `changes/`/`specs/` scaffolding, the
  recognizable fork structure.
- Legal note: reusing warpweave/OpenSpec *code* would make us a derivative work
  (MIT, carries upstream copyright). We build the scaffold from scratch.

## Honesty commitments

1. Never claim to "understand the user" — we sort tasks well.
2. Never promise universal quality on unverifiable work — judgment has a floor.
3. Every claimed win must be measurable (tests pass? fewer tokens? fewer revisions?).
