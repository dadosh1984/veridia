## MODIFIED Requirements

### Requirement: Calibration is explicit
The system SHALL NOT default sensitivity and precision to 1.0 in verify. If no calibration data is provided, the base weight SHALL be used as-is.

#### Scenario: No calibration data
- **WHEN** verify runs without sensitivity or precision deps
- **THEN** each oracle's weight SHALL be its base weight (not silently multiplied by 1)
