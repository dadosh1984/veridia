# classify Specification

## Purpose

Lets veridia sort any task string into a deterministic task type with a confidence score, so downstream routing can choose the right orchestration and model tier without guessing.

## Requirements

### Requirement: Classify command

The system SHALL provide a `classify` subcommand that accepts a task string and prints a classification result. The classifier SHALL accept an optional `config` parameter. When provided, pattern definitions from the config SHALL be used instead of the built-in defaults.

#### Scenario: Classify a bug fix
- **WHEN** the user runs `veridia classify "fix the null pointer in login"` 
- **THEN** the CLI prints a classification naming the type `bugfix`
- **AND** the CLI exits with status 0

#### Scenario: Classify a feature
- **WHEN** the user runs `veridia classify "add dark mode support"`
- **THEN** the CLI prints a classification naming the type `feature`
- **AND** the CLI exits with status 0

#### Scenario: Classify documentation
- **WHEN** the user runs `veridia classify "write API docs for the auth module"`
- **THEN** the CLI prints a classification naming the type `doc`
- **AND** the CLI exits with status 0

#### Scenario: Missing task argument
- **WHEN** the user runs `veridia classify` with no task string
- **THEN** the CLI exits with a non-zero status
- **AND** the CLI writes an error message to stderr

#### Scenario: Classify with user-configured patterns
- **WHEN** the user creates `.veridia/config.json` with custom classify patterns
- **AND** runs `veridia classify "custom task"`
- **THEN** the classifier SHALL use the user's patterns instead of built-in defaults

#### Scenario: Classify without config uses defaults
- **WHEN** no `.veridia/config.json` exists
- **AND** the user runs `veridia classify "fix bug"`
- **THEN** the classifier SHALL use the built-in default patterns (unchanged behavior)

### Requirement: Task type taxonomy

The system SHALL classify a task into exactly one of these types: `bugfix`, `refactor`, `feature`, `doc`, `explore`, `open`.

#### Scenario: Refactor classified
- **WHEN** the user runs `veridia classify "restructure the payment module"`
- **THEN** the CLI prints a classification naming the type `refactor`
- **AND** the CLI exits with status 0

#### Scenario: Exploration classified
- **WHEN** the user runs `veridia classify "evaluate three database options"`
- **THEN** the CLI prints a classification naming the type `explore`
- **AND** the CLI exits with status 0

#### Scenario: Ambiguous task falls back to open
- **WHEN** the user runs `veridia classify "help me with something"`
- **THEN** the CLI prints a classification naming the type `open`
- **AND** the CLI exits with status 0

### Requirement: Deterministic output with confidence

The system SHALL return a deterministic classification with a numeric confidence score, such that the same task string always yields the same type and score.

#### Scenario: Confidence is a number
- **WHEN** the user runs `veridia classify "fix the null pointer in login"`
- **THEN** the classification output includes a numeric confidence value between 0 and 1
- **AND** the CLI exits with status 0

#### Scenario: Repeatable result
- **WHEN** the user runs `veridia classify "fix the null pointer in login"` twice
- **THEN** the second run produces the same type and confidence as the first
- **AND** the CLI exits with status 0

### Requirement: Exit status contract

The system SHALL exit 0 on a successful classification and non-zero when the invocation is invalid (e.g., missing task argument).

#### Scenario: Successful classification exits zero
- **WHEN** a task string is classified successfully
- **THEN** the exit status SHALL be 0

#### Scenario: Invalid invocation exits non-zero
- **WHEN** the user runs `veridia classify` with no task string
- **THEN** the exit status SHALL be non-zero
