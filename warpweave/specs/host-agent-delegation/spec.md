## Purpose

Delegate execution of the plan to the host AI agent (Claude Code, Cursor, OpenCode, etc.) using its native invocation mechanism, so veridia never needs to call external models directly.

## Requirements

### Requirement: Host agent is detected at runtime

The system SHALL detect which AI agent is hosting veridia by inspecting environment variables, process arguments, or configuration files.

#### Scenario: Detect Claude Code
- **WHEN** the `CLAUDE_CODE` environment variable is set or `.claude/` config exists
- **THEN** the system SHALL identify the host as "claude"

#### Scenario: Detect OpenCode
- **WHEN** the `OPENCODE` environment variable is set or `.opencode/` config exists
- **THEN** the system SHALL identify the host as "opencode"

#### Scenario: Fallback to generic shell
- **WHEN** no known agent is detected
- **THEN** the system SHALL fall back to generic shell command execution

### Requirement: Delegation uses host agent's native protocol

The system SHALL format the execution plan according to the host agent's invocation style (flat, namespaced, file-based) and pass it for execution.

#### Scenario: Claude Code namespaced invocation
- **WHEN** the host agent is Claude Code
- **THEN** the system SHALL output the plan as a `/ww:execute` command with JSON payload

#### Scenario: OpenCode flat invocation
- **WHEN** the host agent is OpenCode
- **THEN** the system SHALL output the plan as a `/ww-execute` command with JSON payload

### Requirement: Delegation returns execution result

The system SHALL capture the host agent's execution result (exit code, stdout, stderr) and return it to the caller.

#### Scenario: Successful execution returns exit code 0
- **WHEN** the host agent completes all steps successfully
- **THEN** the system SHALL return exit code 0 with the execution result

#### Scenario: Failed execution returns non-zero
- **WHEN** the host agent fails a step or a verification gate
- **THEN** the system SHALL return non-zero exit code with error details
