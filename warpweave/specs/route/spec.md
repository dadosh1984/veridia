# route Specification

## Purpose

Lets veridia turn a (task type, verifiability level) pair into a deterministic run plan — orchestration depth, model tier, trust stance, and the steps/checks that will gate execution.

## Requirements

### Requirement: route subcommand accepts type and level

The `route` subcommand SHALL accept a `--type <type>` flag holding a task type (`bugfix` | `refactor` | `feature` | `doc` | `explore` | `open`) and a `--level <level>` flag holding a verifiability level (`0` | `1` | `2` | `3`). Both flags SHALL be required.

#### Scenario: both flags given
- **WHEN** the user runs `veridia route --type feature --level 2`
- **THEN** the command prints a run plan and exits 0

#### Scenario: missing level flag
- **WHEN** the user runs `veridia route --type feature`
- **THEN** the command exits non-zero and writes an error to stderr naming the missing flag

#### Scenario: invalid type value
- **WHEN** the user runs `veridia route --type bogus --level 2`
- **THEN** the command exits non-zero and writes an error to stderr naming the invalid type

#### Scenario: invalid level value
- **WHEN** the user runs `veridia route --type feature --level 9`
- **THEN** the command exits non-zero and writes an error to stderr naming the invalid level

### Requirement: route prints a run plan

The `route` command SHALL output a run plan containing at least: orchestration depth, model tier, and a trust stance. The plan SHALL be deterministic: the same `(type, level)` input always produces the same plan.

#### Scenario: full verifiability plan
- **WHEN** the user runs `veridia route --type bugfix --level 3`
- **THEN** the plan names full TDD orchestration, a cheapest/confident model tier, and trust in the mechanical verifier

#### Scenario: partial verifiability plan
- **WHEN** the user runs `veridia route --type feature --level 2`
- **THEN** the plan names TDD-where-possible orchestration, a mid-tier model, and structural verification with judgment deferred to a human

#### Scenario: human-only verifiability plan
- **WHEN** the user runs `veridia route --type explore --level 1`
- **THEN** the plan names minimal orchestration, a human judgment trust stance, and clarifying questions

#### Scenario: no-verifiability plan
- **WHEN** the user runs `veridia route --type open --level 0`
- **THEN** the plan names minimal "just do it" orchestration and the cheapest model tier with human judgment as the floor

#### Scenario: repeatable plan
- **WHEN** the same `--type` and `--level` are routed twice
- **THEN** both runs produce identical plans

### Requirement: task type modulates the plan steps

The task type SHALL modulate the plan's step list without changing the level's gating role: `explore` and `open` skip the execute-and-verify loop; `doc` and `feature` select their own step sets; `bugfix` and `refactor` keep the full TDD loop. Every plan SHALL still list which orchestration steps run and which checks gate the result.

#### Scenario: explore omits the TDD loop
- **WHEN** the user routes an `explore` task at any level
- **THEN** the plan does not include the execute-and-verify TDD step

#### Scenario: bugfix includes the TDD loop
- **WHEN** the user routes a `bugfix` task at level 3
- **THEN** the plan includes the execute-and-verify TDD step

#### Scenario: every plan lists steps and checks
- **WHEN** any `(type, level)` pair is routed
- **THEN** the plan includes a steps list and a checks list

### Requirement: route is deterministic and local

The `route` command SHALL be deterministic for a given input, MUST NOT call any external model or network service, and SHALL produce its plan purely from the static mapping table.

#### Scenario: offline operation
- **WHEN** the user runs `veridia route --type doc --level 1` with no network access
- **THEN** the command completes and prints the same plan it would print online

#### Scenario: repeated runs agree
- **WHEN** the user runs `veridia route --type feature --level 2` twice
- **THEN** both runs print the identical plan
