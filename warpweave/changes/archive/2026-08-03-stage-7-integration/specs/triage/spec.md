## Purpose

Lets veridia run the full triage loop (classify → assess → route → ask? → verify → measure) on a task string in a single command — the primary user-facing entrypoint.

## ADDED Requirements

### Requirement: triage runs the full loop

The `triage` module SHALL accept a task string, run classify → assess → route → ask? → verify → measure in sequence, and print a summary of each step's result.

#### Scenario: triage a feature task
- **WHEN** the user runs `veridia "add dark mode support"`
- **THEN** the command runs classify, assess, route, ask, verify, and measure in sequence
- **AND** prints a summary with type, level, plan, verdict, and recorded outcome

#### Scenario: triage with no task string
- **WHEN** the user runs `veridia` with no arguments
- **THEN** the command prints usage information and exits 0

### Requirement: triage records outcome via measure

The `triage` module SHALL call `measureRecord` with the final outcome (task, type, level, verdict, checks, drift) after the loop completes.

#### Scenario: outcome recorded
- **WHEN** the triage loop completes
- **THEN** an entry is appended to `.veridia/history.jsonl` with the run's outcome

### Requirement: triage is deterministic and local

The `triage` module SHALL be deterministic for a given task and target state, MUST NOT call any external model or network service, and SHALL use only the local mechanisms.

#### Scenario: offline operation
- **WHEN** the user runs `veridia "fix bug"` with no network access
- **THEN** the command completes and prints a summary
