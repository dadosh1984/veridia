# Verifiability — the crux (mechanism 2)

The single deepest design problem: **mechanically deciding whether a task can be
verified.** This determines orchestration depth, model routing, and how much we
can trust the result.

## Principle: probe the repo, don't guess the prompt

Do not infer verifiability from keywords in the prompt. Ask the actual code:
does this project have a test runner? tests touching the target? CI? type-check?
lint? This grounds the decision in reality rather than heuristics.

## Two axes

```
Axis A — IS THERE AN ORACLE (a source of truth)?
  0 none         → pure judgment/taste (doc, copy, strategy)
  1 human-only   → only the user knows the answer
  2 partial      → structural check exists (types/lint), no semantics
  3 full         → executable check exists (test/compiler/CI)

Axis B — WHAT KIND OF ORACLE (determines verifier strength)?
  compiler/types │ test runner │ lint/format │ external spec │ human
```

## Mechanical probe (decision tree)

```
Does the repo have a test runner + tests touching the target?   → 2 or 3
Does CI / type-check / lint cover the target?                   → strengthens to 3/2
Is the task deterministic ("return X", "equal to Y")?            → 3
Otherwise / uncertain                                            → level 1 → ASK
```

## Consequence matrix

| Level | Process | Model routing | How to trust |
|---|---|---|---|
| 3 full | full TDD | cheapest, confidently | trust the verifier |
| 2 partial | TDD where possible + ask humans | mid | verify structure; judgment → human |
| 1 human-only | minimal + 2–3 questions | any | human judgment = floor |
| 0 none | just do it + ask expectation | cheapest | human judgment = floor |

## The subtle trap: false verifiability (verifiability theater)

Existence of a check ≠ the check captures meaning. A weak model can game a weak
oracle (pass the linter, green but empty). Therefore:

```
Criterion is not "does a check exist"
criterion is "how much does the check capture meaning"
```

Weight the verifier, don't just switch it on. The learn/token-budget loop is the
sensor for theater: rising cost with no rise in meaning = false verifiability.

## How we weigh an oracle WITHOUT reliable judgment

Acknowledged problem: judging an oracle's "meaning capture" needs judgment, which
we can't trust from a weak model. Solution is two MECHANICAL signals (no judgment
required):

```
oracle_weight = mutation_sensitivity   (static, cheap, run now)
              combined with
                historical_precision    (dynamic, accumulates via measure/learn)
```

### 1. Mutation sensitivity (static)
Don't ask an opinion — test whether the oracle can *distinguish* good from broken:

```
take a "correct" output → deliberately break it semantically (a mutation)
   (change logic / data / condition)

oracle passed the broken one?  → weak / theater  (does not sense meaning)
oracle rejected the broken one? → strong          (senses meaning)
```

Mutation testing applied to the oracle itself. No judgment about "correctness" —
only "does the check tell good from broken." Model-independent.

### 2. Historical precision (dynamic, via learn)
An oracle earns trust = how often a pass predicted real correctness:

```
how often did a "green" check actually mean "right" (per human feedback /
later drift)? → the verifier's precision (positive predictive value)
```

If over N runs the oracle "blesses" outputs the human then fixes, its weight drops.
Accumulates in learn automatically, without one-off judgments.

Combined effect:
```
high → trust the verifier cheaply and confidently
low  → treat verifiability as effectively lower, ask the human
```

This calibration *is* mechanism 5 (measure/learn) — no honest oracle-weight
without learn, and no point routing cheap without a weighted oracle. One closed loop.

## Open questions to resolve later

- ~~How do we weigh an oracle's "meaning capture"?~~ — resolved: mutation
  sensitivity + historical precision (see above).
- What's the default when repo context is empty / new project? (assume human-only,
  ask early)
- How fine-grained: per-task verifiability inside one repo? (yes — a repo with
  tests can still receive an unverifiable task)
