## MODIFIED Requirements

### Requirement: Sensitivity computed and passed to verify
The system SHALL compute mutation sensitivity during the triage pipeline and pass it to the verify stage.

#### Scenario: Sensitivity affects oracle weight
- **WHEN** triage runs the full pipeline
- **THEN** it SHALL call `computeSensitivity()` on the correct output
- **THEN** it SHALL pass the sensitivity result to `verify()` via deps

### Requirement: Oracle results recorded
The system SHALL record per-oracle true/false positives in `MeasureEntry.oracleResults` after each verify run.

#### Scenario: Oracle results persisted
- **WHEN** triage completes a verify run
- **THEN** it SHALL write `oracleResults` to the measure entry
- **THEN** `computePrecision()` SHALL return non-empty data on subsequent runs
