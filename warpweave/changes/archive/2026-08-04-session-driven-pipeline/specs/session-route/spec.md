## Purpose

Builds a run plan from the session's type and level, and writes the plan to the session file.

## ADDED Requirements

### Requirement: Route from session

The command SHALL read `type` and `level` from the session file and build a plan.

#### Scenario: Route from session
- **WHEN** the user runs `veridia session-route`
- **THEN** the system SHALL read `type` and `level` from the session and write `plan` to the session

### Requirement: Step advances to ask

After routing, the session `step` SHALL advance to `ask`.

#### Scenario: Step advances
- **WHEN** routing completes
- **THEN** `session.step` SHALL be set to `ask`
