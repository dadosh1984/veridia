## Purpose

Records the completed session to the measure history and clears the session file.

## ADDED Requirements

### Requirement: Archive from session

The command SHALL read the session, record it to history, and delete the session file.

#### Scenario: Session archived
- **WHEN** the user runs `veridia session-archive`
- **THEN** the system SHALL record the session to `.veridia/history.jsonl` and delete `.veridia/session.json`

#### Scenario: No session
- **WHEN** no session file exists
- **THEN** the system SHALL print "No active session to archive"
