## Purpose

Run verification checks against the host agent's output after execution completes, closing the triage loop with a concrete verdict on the work done.

## ADDED Requirements

### Requirement: Verify accepts post-execution target

The system SHALL accept a target path after execution has completed and run verification checks against the modified codebase.

#### Scenario: Verify after file modification
- **WHEN** the host agent modifies files in the target directory
- **THEN** the system SHALL run the same checks from the route plan against the modified target

### Requirement: Verify reports which checks pass and fail

The system SHALL report each check individually (kind, command, passed/ failed, weak/strong) alongside the overall verdict.

#### Scenario: All checks pass
- **WHEN** all verification checks pass
- **THEN** the system SHALL return verdict `PASS` with the list of passing checks

#### Scenario: Some checks fail
- **WHEN** one or more verification checks fail
- **THEN** the system SHALL return verdict `FAIL` with the list of failing checks and their output

### Requirement: Measure records the full execution cycle

The system SHALL record the complete execution cycle (task, type, level, plan, verdict, checks, drift) to the history log.

#### Scenario: Full cycle recorded
- **WHEN** the triage loop completes with execution
- **THEN** the history SHALL contain the task, type, level, plan steps, verdict, and check results
