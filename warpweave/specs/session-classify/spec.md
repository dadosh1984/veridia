# session-classify Specification

## Purpose
Classifies a task string and writes the result (type, confidence) to the session file.
## Requirements
### Requirement: Classify from session or arg

The command SHALL accept a task string as argument, or read it from the session file if no argument is given.

#### Scenario: Task from argument
- **WHEN** the user runs `veridia session-classify "add auth"`
- **THEN** the system SHALL classify the task and write `type` and `confidence` to the session

#### Scenario: Task from session
- **WHEN** the user runs `veridia session-classify` with no argument and a session exists
- **THEN** the system SHALL classify the task from the session's `task` field

### Requirement: Step advances to assess

After classification, the session `step` SHALL advance to `assess`.

#### Scenario: Step advances
- **WHEN** classification completes
- **THEN** `session.step` SHALL be set to `assess`

