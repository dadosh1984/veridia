## MODIFIED Requirements

### Requirement: triage records outcome via measure

The `triage` module SHALL call `measureRecord` with the final outcome (task, type, level, verdict, checks, drift) after the loop completes. The `drift` field SHALL be calculated from recent history — non-zero when the current verdict diverges from the historical success rate.

#### Scenario: drift is calculated from history
- **WHEN** the triage loop completes
- **THEN** the `drift` field in the recorded entry SHALL be a non-empty string calculated from recent history

#### Scenario: drift is zero on first run
- **WHEN** the triage loop completes with no prior history
- **THEN** the `drift` field SHALL be `"0"`

### Requirement: triage loads user config

The `triage` module SHALL load user configuration via `loadConfig()` and pass it to `classify()` so that user-defined patterns are respected.

#### Scenario: triage uses user-configured patterns
- **WHEN** the user creates `.veridia/config.json` with custom classify patterns
- **AND** runs `veridia "custom task"`
- **THEN** the classification step SHALL use the user's patterns
