## Purpose

Provides consistent structured logging with levels (info/warn/error/debug), machine-readable JSON output in non-TTY mode, and human-readable formatting in TTY mode.

## ADDED Requirements

### Requirement: logger with levels

The logger SHALL support four levels: `debug`, `info`, `warn`, `error`. Each level SHALL be callable as `log.info(...)`, `log.warn(...)`, etc.

#### Scenario: log at each level
- **WHEN** the logger is called at any level
- **THEN** the output is written to stderr
- **AND** the level prefix is included in the output

### Requirement: machine-readable JSON output

When stderr is not a TTY (piped, CI, MCP), the logger SHALL output each message as a single JSON line with fields: `level`, `msg`, `timestamp`.

#### Scenario: JSON output in non-TTY mode
- **WHEN** stderr is not a TTY
- **THEN** each log line is valid JSON with `level`, `msg`, and `timestamp` fields

#### Scenario: human-readable output in TTY mode
- **WHEN** stderr is a TTY
- **THEN** each log line is formatted as `veridia: <level>: <msg>`

### Requirement: debug level gated by VERIDIA_DEBUG env

The `debug` level SHALL only produce output when the `VERIDIA_DEBUG` environment variable is set to `1` or `true`.

#### Scenario: debug output gated
- **WHEN** `VERIDIA_DEBUG` is not set
- **THEN** `log.debug()` calls produce no output
- **WHEN** `VERIDIA_DEBUG=1`
- **THEN** `log.debug()` calls produce output
