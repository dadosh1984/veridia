## Purpose

Keeps veridia's stdout clean for machine consumers: in JSON mode, non-interactive (--auto) mode, and MCP stdio transport, stdout carries only the machine-readable result while all diagnostics and child-process output go to stderr.

## ADDED Requirements

### Requirement: child-process stdout is never inherited

Veridia SHALL capture the stdout of any child process it spawns (verification gates, plan gates, delegated commands) instead of inheriting it, so no foreign bytes (ANSI, banners, logs) can reach veridia's own stdout.

#### Scenario: gate output is captured
- **WHEN** veridia runs a verification gate whose process writes text to its stdout
- **THEN** that text is captured by veridia and not written verbatim to veridia's stdout

#### Scenario: JSON output stays clean
- **WHEN** the user runs `veridia <task> --target .` (or any JSON-emitting invocation) against a target with real test/lint gates
- **THEN** the entire veridia stdout is a single parseable JSON value with no embedded child-process output or ANSI codes

### Requirement: diagnostics and child output route to stderr

Veridia SHALL write all diagnostic messages and any child-process output it surfaces to stderr, never to stdout.

#### Scenario: child output surfaced on failure
- **WHEN** a verification gate fails and veridia surfaces the child's output for diagnosis
- **THEN** that output is written to stderr, and the machine-readable result is still the only thing on stdout

### Requirement: MCP transport preserves protocol integrity

The MCP server SHALL ensure no child-process output is written to stdout while connected over a stdio transport, because stdout is the JSON-RPC channel.

#### Scenario: veridia_verify over stdio transport
- **WHEN** an MCP client calls `veridia_verify` on a target whose gates produce output
- **THEN** the JSON-RPC response frame is well-formed and contains no child-process bytes mixed into the transport stream
