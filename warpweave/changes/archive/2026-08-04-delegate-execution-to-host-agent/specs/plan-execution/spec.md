## Purpose

Generate structured execution plans from route output so the host AI agent knows exactly what steps to perform, which files to modify, and what commands to run.

## ADDED Requirements

### Requirement: Plan is generated from route output

The system SHALL accept a RunPlan (depth, tier, trust, steps, checks) and produce an ExecutionPlan with concrete actions.

#### Scenario: Route plan maps to execution steps
- **WHEN** route produces steps `["ask", "write-failing-test", "implement", "verify"]`
- **THEN** the execution plan SHALL contain corresponding action blocks for each step

### Requirement: Plan includes file targets

The system SHALL identify which files in the target directory are relevant to the task and include them in the execution plan.

#### Scenario: Plan lists files to modify
- **WHEN** a task targets a specific file or module
- **THEN** the execution plan SHALL list the file paths with their current state and intended change

### Requirement: Plan includes verification gates

The system SHALL embed verification commands (from the route plan's checks) as gates between execution steps.

#### Scenario: Verify gate after implementation
- **WHEN** the execution plan reaches the "implement" step
- **THEN** the plan SHALL include a verification gate that runs the checks from the route plan before proceeding

### Requirement: Plan is serializable to JSON

The system SHALL output the execution plan as JSON for the host agent to consume.

#### Scenario: Plan outputs valid JSON
- **WHEN** the plan command is invoked
- **THEN** the output SHALL be valid JSON with fields: `steps`, `files`, `gates`, `metadata`
