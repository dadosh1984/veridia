## Purpose

Lets veridia run its own triage pipeline against a warpweave change — classify, assess, route, verify, measure — and report the cycle result, closing the dogfooding loop.

## ADDED Requirements

### Requirement: develop command runs the full triage loop

The `develop` command SHALL accept a change name and run the full triage pipeline against it: classify the change description, assess the target, route to a plan, run verification gates, derive a verdict, and record the result in history.

#### Scenario: develop against a change
- **WHEN** the user runs `veridia develop --change <name>` and the change exists
- **THEN** the command runs triage against the change's proposal description
- **AND** prints the verdict and cycle summary

#### Scenario: develop with no change name
- **WHEN** the user runs `veridia develop` without `--change`
- **THEN** the command prints an error and exits non-zero

### Requirement: cycle result is recorded and reported

The `develop` command SHALL record the triage result (verdict, drift, checks) into `.veridia/history.jsonl` and SHALL print a summary including the verdict, number of checks, and drift.

#### Scenario: cycle recorded to history
- **WHEN** `veridia develop --change <name>` completes
- **THEN** a new entry is appended to `.veridia/history.jsonl` with the verdict, checks, and drift

#### Scenario: summary printed
- **WHEN** the develop cycle finishes
- **THEN** the command prints verdict, check count, and drift to stdout as JSON
