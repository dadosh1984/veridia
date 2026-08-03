## MODIFIED Requirements

### Requirement: route includes ai-ready tier

The `route` command SHALL support an `ai-ready` orchestration depth that outputs agent instructions for AI-assisted execution, in addition to the existing deterministic depths.

#### Scenario: route with ai-ready depth
- **WHEN** the user runs `veridia route --type feature --level 3 --agent claude`
- **THEN** the plan includes `ai-ready` depth with agent instructions

#### Scenario: route without --agent
- **WHEN** the user runs `veridia route --type feature --level 3`
- **THEN** the plan uses existing deterministic depths (unchanged behavior)
