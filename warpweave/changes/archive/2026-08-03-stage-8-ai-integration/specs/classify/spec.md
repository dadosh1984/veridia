## MODIFIED Requirements

### Requirement: classify with --agent flag

When the `--agent` flag is provided, the `classify` command SHALL output structured JSON instructions for the specified AI agent to classify the task, instead of running the regex-based classifier.

#### Scenario: classify with --agent
- **WHEN** the user runs `veridia classify --agent claude "refactor the authentication module"`
- **THEN** the command outputs JSON with `task`, `instruction`, `agent`, and `expectedOutput` fields

#### Scenario: classify without --agent
- **WHEN** the user runs `veridia classify "refactor the module"`
- **THEN** the command runs the existing regex-based classifier (unchanged behavior)
