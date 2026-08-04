## Purpose

Prints the current session state and suggests the next step to run.

## ADDED Requirements

### Requirement: Status display

The command SHALL read the session file and print a human-readable summary.

#### Scenario: Session displayed
- **WHEN** the user runs `veridia session-status`
- **THEN** the system SHALL print: task, type, confidence, level, plan, answers, verdict, current step, and next suggested command

#### Scenario: No session
- **WHEN** no session file exists
- **THEN** the system SHALL print "No active session. Start with `veridia session-classify <task>`"
