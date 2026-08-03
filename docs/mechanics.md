# Mechanics

The heart of veridia is five mechanisms. Each is measurable mechanics, not a
marketing promise.

```
INTENT ──▶ CLASSIFY ──▶ ASSESS VERIFIABILITY ──▶ ROUTE
             type           (the crux)            model + process
                │                │                     │
                └─────── VERIFY ── MEASURE ←────────────┘
                        (find truth)   (learn from misses)
```

## 1. Classify — task type

Recognize what kind of task it is: bug fix, refactor, feature, documentation,
exploration, open-ended writing. Determinable cheaply (weak model + heuristics on
the prompt). Determines which orchestration template applies.

## 2. Assess verifiability — is there an oracle?

**The crux.** Decided by probing the *repository*, not guessing from prompt keywords.
See [verifiability.md](verifiability.md) for the full model. Output is a level 0–3.

## 3. Route — cheapest sufficient model + orchestration depth

Gated by verifiability level:

| Verifiability | Orchestration | Routing | Trust |
|---|---|---|---|
| 3 (full machine) | full TDD | cheapest, confidently | trust the verifier |
| 2 (partial) | TDD where possible + ask humans | mid | verify structure; judgment → human |
| 1 (human-only) | minimal orchestration + 2–3 questions | any | trust human judgment = floor |
| 0 (none) | just do it + ask expectation | cheapest | human judgment = floor |

## 4. Verify — the weighted verifier

Find the source of truth and *weigh* it, never just turn it on:

```
Oracle type:  compiler/types │ test runner │ lint/format │ external spec │ human
Strong:       tests that capture meaning  → high weight
Weak/theater: lints, empty mocks, green-but-empty → low weight
```

Guard against **verifiability theater**: a weak model can learn to pass a
meaningless check (green checkmarks with no content). The verifier must be
weighted by how much it *captures meaning*, not by whether it exists.

## 5. Measure — self-check the intuition

After each run, ask "did I hit the user's expectation?" Use the reuse of
drift-check + token-budget + learn ideas:

- **drift vs expectations** (not just vs a spec): did we infer the intent right?
- **token/cost visibility** per phase.
- **learn**: mine own history for patterns (estimation accuracy, which
  model/orchestration thickness was sufficient).

If cost grows but meaning doesn't → signal of false verifiability.
This loop is what makes the "intuition" self-correcting instead of a lottery.

## Proposed interface (skills/commands — for design discussion only)

| Skill | Mechanism | Purpose |
|---|---|---|
| `assess` | 1 + 2 | classify task + determine verifiability |
| `route` | 3 | choose model + orchestration thickness |
| `ask`   | (honest ask) | 2 short questions when level is 1/0 |
| `verify`| 4 | run + weigh the verifier |
| `measure`| 5 | drift vs expectations, accumulate into learn |

Sequence: `assess → route → ask? → (execute with verify) → measure`

## Runtime loop (do NOT copy OpenSpec's lifecycle)

We deliberately do **not** use the heavy `propose → spec → design → task → apply
→ archive` chain from OpenSpec/warpweave. That is fork baggage. Instead, ceremony
thickness adapts to verifiability:

| Verifiability | Runtime path |
|---|---|
| 3 (full machine) | assess → route → do → VERIFY → measure |
| 2 (partial) | assess → route → ask → do → PARTIAL verify → measure |
| 1 (human-only) | assess → route → ask(3) → do → HUMAN check → measure |
| 0 (none) | assess → route → ask(expectation) → do → measure |

One artifact instead of five specs: **`intent`** — a short explicit expectation
of "what counts as done," agreed with the human. For verifiable tasks, intent ≈
tests; for unverifiable tasks, intent = the stated expectation.

Our vocabulary (own, not borrowed): `assess → route → ask? → do → verify → measure`.
The "archive" role is folded into `measure`/`close` (record the run into history
for learn).
