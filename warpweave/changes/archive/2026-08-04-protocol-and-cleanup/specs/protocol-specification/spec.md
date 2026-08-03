## Purpose

Define versioned JSON protocol formats for veridia's three core outputs — ExecutionPlan, VerificationReport, and LearnResult — so any AI agent can produce or consume them without coupling to veridia's implementation.

## ADDED Requirements

### Requirement: ExecutionPlan includes protocol field

The system SHALL include a `protocol` field in every ExecutionPlan output, identifying the format version.

#### Scenario: ExecutionPlan has protocol version
- **WHEN** the system generates an ExecutionPlan
- **THEN** the output SHALL contain `"protocol": "veridia/execution-plan/v1"`

### Requirement: VerifyResult includes protocol field

The system SHALL include a `protocol` field in every VerifyResult output.

#### Scenario: VerifyResult has protocol version
- **WHEN** the system generates a VerifyResult
- **THEN** the output SHALL contain `"protocol": "veridia/verification-report/v1"`

### Requirement: LearnResult includes protocol field

The system SHALL include a `protocol` field in every LearnResult output.

#### Scenario: LearnResult has protocol version
- **WHEN** the system generates a LearnResult
- **THEN** the output SHALL contain `"protocol": "veridia/learn-result/v1"`

### Requirement: Protocol is documented

The system SHALL include human-readable protocol documentation in `docs/protocol/`.

#### Scenario: Protocol docs exist
- **WHEN** a developer reads `docs/protocol/`
- **THEN** they SHALL find markdown files describing ExecutionPlan, VerificationReport, and LearnResult formats
