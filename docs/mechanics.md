# Mechanics

The heart of veridia is six mechanisms. Each is measurable mechanics, not a
marketing promise.

```
CLASSIFY ──▶ ASSESS ──▶ ROUTE ──▶ ASK? ──▶ VERIFY ──▶ MEASURE
  type        level       plan      clarify   check     learn
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

## 5. Ask — honest triage

When verifiability is low (level 0 or 1), generate 2-3 clarifying questions
and present them interactively via the terminal. Collect answers and feed them
into the pipeline for better routing and execution decisions.

## 6. Measure — self-check the intuition

After each run, ask "did I hit the user's expectation?" Use the reuse of
drift-check + token-budget + learn ideas:

- **drift vs expectations** (not just vs a spec): did we infer the intent right?
- **token/cost visibility** per phase.
- **learn**: mine own history for patterns (estimation accuracy, which
  model/orchestration thickness was sufficient).

If cost grows but meaning doesn't → signal of false verifiability.
This loop is what makes the "intuition" self-correcting instead of a lottery.

## Proposed interface (skills/commands)

| Skill | Mechanism | Purpose |
|---|---|---|
| `classify` | 1 | classify task type from description |
| `assess` | 2 | determine verifiability level by probing repo |
| `route` | 3 | choose model + orchestration thickness |
| `ask`   | 4 | 2-3 clarifying questions when level is 1/0 |
| `verify`| 5 | run + weigh the verifier |
| `measure`| 6 | drift vs expectations, accumulate into learn |

Sequence: `classify → assess → route → ask? → execute → verify → measure`

## Runtime loop

Ceremony thickness adapts to verifiability:

| Verifiability | Runtime path |
|---|---|
| 3 (full machine) | classify → assess → route → do → VERIFY → measure |
| 2 (partial) | classify → assess → route → ask → do → PARTIAL verify → measure |
| 1 (human-only) | classify → assess → route → ask(3) → do → HUMAN check → measure |
| 0 (none) | classify → assess → route → ask(expectation) → do → measure |

Our vocabulary: `classify → assess → route → ask? → execute → verify → measure`.
