## MODIFIED Requirements

### Requirement: ask with --agent flag

When the `--agent` flag is provided, the `ask` command SHALL output structured JSON instructions for the specified AI agent to generate clarifying questions dynamically, instead of using the static question bank.

#### Scenario: ask with --agent
- **WHEN** the user runs `veridia ask --agent claude --type feature --level 1`
- **THEN** the command outputs JSON with `taskType`, `level`, `agent`, and `instruction` fields

#### Scenario: ask without --agent
- **WHEN** the user runs `veridia ask --type feature --level 1`
- **THEN** the command uses the existing static question bank (unchanged behavior)
