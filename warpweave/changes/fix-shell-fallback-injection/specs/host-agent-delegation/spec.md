## MODIFIED Requirements

### Requirement: Fallback to generic shell

The system SHALL fall back to generic shell command execution when no known agent is detected, resolving Windows command shims natively rather than through a raw `shell: true` invocation.

#### Scenario: Fallback to generic shell
- **WHEN** no known agent is detected
- **THEN** the system SHALL fall back to generic shell command execution
- **AND** on Windows, the resolved command SHALL be spawned with `shell: false`

## ADDED Requirements

### Requirement: Windows command shims resolve without a raw shell

On Windows, when the system executes a command that resolves via `node_modules/.bin` shims (`.cmd`/`.exe`/`.bat`), the system SHALL resolve the executable natively (via `PATHEXT`/`PATH`) and spawn it with `shell: false`. The system SHALL NOT invoke commands through `shell: true`.

#### Scenario: .cmd shim resolves natively
- **WHEN** the command is a `node_modules/.bin/*.cmd` shim on Windows
- **THEN** the system resolves the shim file and spawns it with `shell: false`
- **AND** the command executes successfully with the same exit semantics as direct execution

#### Scenario: arguments with special characters survive
- **WHEN** a command argument contains spaces, quotes, `$`, backticks, `;`, or `&`
- **THEN** the argument is passed to the spawned process without shell interpretation
- **AND** the command's exit code reflects the command's own result, not a shell parse error

#### Scenario: no shell:true anywhere
- **WHEN** the system executes any delegated or gate command on any platform
- **THEN** the spawned process never uses `shell: true`
