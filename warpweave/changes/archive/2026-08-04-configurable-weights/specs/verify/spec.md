## ADDED Requirements

### Requirement: verify honors configurable oracle weights
The `verify` command SHALL allow the base weight of an oracle to be overridden by a user-supplied `weights` map (of oracle kind to numeric weight) from the veridia config when present, while falling back to the built-in default weights for any oracle kind not overridden. The override SHALL NOT involve any model or judgment and SHALL only scale the base weight before sensitivity/precision calibration.

#### Scenario: configured weight overrides default
- **WHEN** the config supplies a weight for the `test-runner` oracle and a target declares a test runner
- **THEN** the test oracle uses the configured weight instead of the built-in default

#### Scenario: unconfigured oracle keeps default
- **WHEN** the config supplies weights only for the `test-runner` oracle and a target declares a lint oracle
- **THEN** the lint oracle keeps its built-in default weight
