## Purpose

Executes the plan from the session: runs verification gates, records the verdict, and writes the result to the session file.

## ADDED Requirements

### Requirement: Do from session

The command SHALL read the full session (task, type, level, plan, answers) and execute the plan.

#### Scenario: Plan executed
- **WHEN** the user runs `veridia session-do`
- **THEN** the system SHALL run verification gates and write `verdict` to the session

#### Scenario: Answers included
- **WHEN** the session has `answers`
- **THEN** the system SHALL pass answers to the execution context

### Requirement: Step advances to done

After execution, the session `step` SHALL advance to `done`.

#### Scenario: Step advances
- **WHEN** execution completes
- **THEN** `session.step` SHALL be set to `done`
