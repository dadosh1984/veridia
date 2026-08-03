## MODIFIED Requirements

### Requirement: Classify command

The system SHALL provide a `classify` subcommand that accepts a task string and prints a classification result. The classifier SHALL accept an optional `config` parameter. When provided, pattern definitions from the config SHALL be used instead of the built-in defaults.

#### Scenario: Classify with user-configured patterns
- **WHEN** the user creates `.veridia/config.json` with custom classify patterns
- **AND** runs `veridia classify "custom task"`
- **THEN** the classifier SHALL use the user's patterns instead of built-in defaults

#### Scenario: Classify without config uses defaults
- **WHEN** no `.veridia/config.json` exists
- **AND** the user runs `veridia classify "fix bug"`
- **THEN** the classifier SHALL use the built-in default patterns (unchanged behavior)
