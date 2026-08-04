## Purpose

Mechanically measure whether an oracle (test runner, type checker, linter, CI) can distinguish correct output from semantically broken output, producing a static weight that reflects the oracle's actual meaning-capture ability.

## ADDED Requirements

### Requirement: Mutate output

The system SHALL take a "correct" output string and produce N semantically broken variants (mutations).

#### Scenario: Basic mutation
- **WHEN** the system receives a correct output string
- **THEN** it SHALL produce at least one mutation that changes logic, data, or control flow while preserving syntax validity

#### Scenario: Multiple mutations
- **WHEN** the system mutates an output
- **THEN** it SHALL produce at least 3 distinct mutations per run

### Requirement: Run oracle against mutations

The system SHALL run each oracle against each mutation and record whether the oracle passes or fails.

#### Scenario: Oracle catches mutation
- **WHEN** a mutation is semantically broken
- **THEN** the oracle SHALL fail (non-zero exit code) for that mutation

#### Scenario: Oracle misses mutation
- **WHEN** a mutation is semantically broken but the oracle passes
- **THEN** the system SHALL record that mutation as a miss for that oracle

### Requirement: Compute sensitivity score

The system SHALL compute an oracle's sensitivity as: mutations_caught / total_mutations.

#### Scenario: Perfect oracle
- **WHEN** an oracle catches all mutations
- **THEN** sensitivity SHALL be 1.0

#### Scenario: Blind oracle
- **WHEN** an oracle catches zero mutations
- **THEN** sensitivity SHALL be 0.0

#### Scenario: Partial oracle
- **WHEN** an oracle catches 2 out of 5 mutations
- **THEN** sensitivity SHALL be 0.4

### Requirement: Integrate with verify pipeline

The system SHALL expose mutation sensitivity as a factor in oracle weighting during verification.

#### Scenario: Weight adjustment
- **WHEN** verify runs checks
- **THEN** each oracle's weight SHALL be multiplied by its sensitivity score before computing the verdict
