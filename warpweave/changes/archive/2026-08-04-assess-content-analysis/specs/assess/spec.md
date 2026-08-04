## MODIFIED Requirements

### Requirement: Test content analysis
The system SHALL analyze test file content when a test-runner oracle is detected. If test files contain no assertion tokens (`expect`, `assert`, `it`, `test`), the system SHALL emit a `test-content` oracle with `present: false`.

#### Scenario: Tests with assertions
- **WHEN** a test-runner is detected and test files contain `expect` or `assert`
- **THEN** the system SHALL emit `test-content` oracle with `present: true`

#### Scenario: Empty test files
- **WHEN** a test-runner is detected but test files contain no assertion tokens
- **THEN** the system SHALL emit `test-content` oracle with `present: false`

### Requirement: Level capped for weak tests
When test-runner exists but test-content is weak, the verifiability level SHALL be capped at 2 (partial) instead of 3 (full).

#### Scenario: Weak tests cap level
- **WHEN** test-runner is present and test-content is weak
- **THEN** the level SHALL be at most 2, even if other oracles suggest level 3
