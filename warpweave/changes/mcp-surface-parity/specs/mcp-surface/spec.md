## Purpose

MCP surface parity: exposes the core veridia triage pipeline and quality features as MCP tools so AI agents can drive the full product (route, ask, measure, report, review, session pipeline) through the standard protocol, not just the original five.

## ADDED Requirements

### Requirement: MCP tools mirror CLI commands

The MCP server SHALL expose a tool for each of the core CLI capabilities that maps onto a library function: `veridia_route`, `veridia_ask`, `veridia_measure`, `veridia_report`, `veridia_review`, and the `veridia_session_*` family (classify, assess, route, ask, do, status, archive). Each tool SHALL be named `veridia_<command>` and accept inputs matching the CLI command's options.

#### Scenario: route tool exposed
- **WHEN** a client lists tools on the MCP server
- **THEN** `veridia_route` is present with inputs `type` and `level`
- **AND** calling it with valid inputs returns a run plan JSON

#### Scenario: measure tool exposed
- **WHEN** a client lists tools on the MCP server
- **THEN** `veridia_measure` is present supporting a record mode and a history mode
- **AND** calling it records an entry or returns the history summary

#### Scenario: session tools exposed
- **WHEN** a client lists tools on the MCP server
- **THEN** the `veridia_session_*` tools are present
- **AND** the session pipeline can be driven step by step through them

### Requirement: tool responses are machine-readable

Every MCP tool SHALL return its result as a single JSON value in the tool response content, with no child-process output or diagnostics in the content. Diagnostics SHALL follow the machine-output discipline (stderr / logs), never the response channel.

#### Scenario: verify tool returns clean JSON
- **WHEN** a client calls `veridia_verify` on a target whose gates produce output
- **THEN** the tool response content is a single parseable JSON value with the check results and verdict
- **AND** no gate output appears in the response content

### Requirement: tool coverage is verified

The MCP server's exposed tool set SHALL be checked against the CLI command set so parity regressions are caught: a test SHALL assert that every CLI command with a library-backed implementation has a corresponding MCP tool.

#### Scenario: parity test passes
- **WHEN** the test suite runs
- **THEN** a parity test asserts the MCP tool list covers the expected library-backed command set
