## Purpose

Assesses verifiability of a target directory and writes the result (level, oracles) to the session file.

## ADDED Requirements

### Requirement: Assess from session or arg

The command SHALL accept a `--target` flag, or read the target from the session file.

#### Scenario: Target from flag
- **WHEN** the user runs `veridia session-assess --target /path`
- **THEN** the system SHALL assess the target and write `level` to the session

#### Scenario: Target from session
- **WHEN** the user runs `veridia session-assess` with no `--target` and a session exists
- **THEN** the system SHALL use the current working directory

### Requirement: Step advances to route

After assessment, the session `step` SHALL advance to `route`.

#### Scenario: Step advances
- **WHEN** assessment completes
- **THEN** `session.step` SHALL be set to `route`
