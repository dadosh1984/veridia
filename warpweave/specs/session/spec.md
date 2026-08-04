# session Specification

## Purpose
Provides a shared state file (`.veridia/session.json`) that stores pipeline progress between commands, enabling step-by-step execution and AI-agent resumability.
## Requirements
### Requirement: Session file format

The system SHALL maintain a session file at `.veridia/session.json` with the following structure:

```json
{
  "task": "add user auth",
  "type": "feature",
  "confidence": 0.85,
  "level": 2,
  "plan": { "depth": "tdd-where-possible", "tier": "mid", "steps": [], "checks": [] },
  "answers": { "framework": "express" },
  "verdict": "PASS",
  "step": "done"
}
```

#### Scenario: Session created
- **WHEN** any session-aware command runs
- **THEN** it SHALL create `.veridia/session.json` if it does not exist

#### Scenario: Session read
- **WHEN** a session-aware command runs
- **THEN** it SHALL read the current session from `.veridia/session.json`

#### Scenario: Session written
- **WHEN** a pipeline step completes
- **THEN** the system SHALL write the updated session to `.veridia/session.json`

### Requirement: Step tracking

The session SHALL track the current pipeline step: `classify`, `assess`, `route`, `ask`, `do`, `done`.

#### Scenario: Step advances
- **WHEN** a step completes successfully
- **THEN** the `step` field SHALL advance to the next step

#### Scenario: Resume from step
- **WHEN** `veridia <task>` runs and a session exists with `step` not `done`
- **THEN** the pipeline SHALL resume from the current step instead of starting over

