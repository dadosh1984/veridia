## MODIFIED Requirements

### Requirement: Precision data accumulates
The system SHALL accumulate per-oracle precision data across runs by writing `oracleResults` to each measure entry.

#### Scenario: Precision converges
- **WHEN** multiple runs complete with oracle results
- **THEN** `computePrecision()` SHALL return precision values that reflect accumulated history
