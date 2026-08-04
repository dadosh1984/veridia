## Purpose

Track per-oracle precision over time by recording whether a PASS verdict predicted real correctness (no human fix needed later), and feed this data back into oracle weighting so the system learns which oracles to trust.

## Requirements

### Requirement: Record per-oracle precision

The system SHALL record, for each oracle in each run, whether its PASS verdict was correct (the output was accepted without human fixes).

#### Scenario: Successful pass recorded
- **WHEN** an oracle passes and the output is accepted
- **THEN** the system SHALL record a true positive for that oracle

#### Scenario: False pass recorded
- **WHEN** an oracle passes but the output requires human fixes
- **THEN** the system SHALL record a false positive for that oracle

### Requirement: Compute precision from history

The system SHALL compute each oracle's precision as: true_positives / (true_positives + false_positives).

#### Scenario: Reliable oracle
- **WHEN** an oracle has 10 true positives and 0 false positives
- **THEN** precision SHALL be 1.0

#### Scenario: Unreliable oracle
- **WHEN** an oracle has 2 true positives and 8 false positives
- **THEN** precision SHALL be 0.2

### Requirement: Feed precision into verify

The system SHALL adjust oracle weights by historical precision before each verify run.

#### Scenario: Weight calibrated
- **WHEN** verify runs checks
- **THEN** each oracle's weight SHALL be multiplied by its historical precision (combined with mutation sensitivity)

### Requirement: Persist precision data

The system SHALL persist per-oracle precision data across runs in the measure history.

#### Scenario: Data survives restart
- **WHEN** the system restarts
- **THEN** historical precision data SHALL be available from the measure history file
