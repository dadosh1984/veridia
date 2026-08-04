# session-ask Specification

## Purpose
Asks clarifying questions based on the session's type and level, collects answers interactively, and writes answers to the session file.
## Requirements
### Requirement: Ask from session

The command SHALL read `type` and `level` from the session file and generate questions.

#### Scenario: Questions displayed
- **WHEN** the user runs `veridia session-ask`
- **THEN** the system SHALL display questions interactively and collect answers

#### Scenario: Answers written to session
- **WHEN** the user answers all questions
- **THEN** the system SHALL write `answers` to the session

### Requirement: Skip at high verifiability

When level is 2 or 3, the command SHALL print a decline message and advance without asking.

#### Scenario: Level 3 skips
- **WHEN** session level is 3
- **THEN** the command SHALL print "No questions needed" and advance step

### Requirement: Step advances to do

After asking (or skipping), the session `step` SHALL advance to `do`.

#### Scenario: Step advances
- **WHEN** asking completes or is skipped
- **THEN** `session.step` SHALL be set to `do`

