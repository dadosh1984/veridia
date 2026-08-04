## Purpose

Allow veridia to run its own triage loop on a task and optionally execute it against a target, enabling the project to dogfood its own workflow.

## ADDED Requirements

### Requirement: Run command

The system SHALL provide a `veridia run` command that executes the full triage pipeline (classify → assess → route → ask → execute → verify → measure) in one invocation.

#### Scenario: Full pipeline run
- **WHEN** the user runs `veridia run "task description" --target /path`
- **THEN** the system SHALL run all pipeline stages and output the final verdict

#### Scenario: Pipeline stages visible
- **WHEN** the pipeline runs
- **THEN** each stage's output SHALL be visible (type, level, plan, questions, verdict)

### Requirement: Warpweave integration

The system SHALL support running the triage loop against a warpweave change directory.

#### Scenario: Change as target
- **WHEN** the user runs `veridia run "implement X" --ww --change "change-name"`
- **THEN** the system SHALL use the change's specs and design as context

### Requirement: Self-test mode

The system SHALL support a `--self` flag that runs veridia against its own source code.

#### Scenario: Self-test
- **WHEN** the user runs `veridia run "refactor X" --self`
- **THEN** the system SHALL target the veridia project root
