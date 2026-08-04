## Purpose

Integrate AI models into the veridia pipeline as an execution backend, making veridia a model-agnostic orchestrator that calls any model, feeds it context, collects output, runs verifiers, and retries on failure.

## ADDED Requirements

### Requirement: Model-agnostic interface

The system SHALL support calling AI models via a pluggable interface that abstracts over stdio (local models) and HTTP API (remote models).

#### Scenario: Local model via stdio
- **WHEN** the model provider is "stdio"
- **THEN** the system SHALL spawn the model process and communicate via stdin/stdout

#### Scenario: Remote model via API
- **WHEN** the model provider is "api"
- **THEN** the system SHALL make HTTP requests to the configured API endpoint

### Requirement: Context assembly

The system SHALL assemble a prompt from the task description, target project context, and pipeline state (type, level, plan, answers).

#### Scenario: Full context prompt
- **WHEN** the system calls a model
- **THEN** the prompt SHALL include: task description, task type, verifiability level, run plan, and any collected answers

### Requirement: Output collection

The system SHALL collect model output and pass it to the verify stage.

#### Scenario: Output collected
- **WHEN** the model returns output
- **THEN** the system SHALL capture the output as a string

#### Scenario: Output verified
- **WHEN** the output is collected
- **THEN** the system SHALL run the verify stage against the output

### Requirement: Retry on failure

When verification fails, the system SHALL retry with the failure context included in the prompt.

#### Scenario: Retry with context
- **WHEN** verify returns FAIL
- **THEN** the system SHALL retry the model call with the failure details in the prompt

#### Scenario: Max retries
- **WHEN** the number of retries exceeds the configured maximum
- **THEN** the system SHALL return the best output and mark verdict as FAIL

### Requirement: Model configuration

The system SHALL support configuration of model provider, model name, API key (via env var), temperature, and max tokens.

#### Scenario: Config from file
- **WHEN** the system starts
- **THEN** it SHALL read model configuration from `.veridia/config.json`

#### Scenario: API key from env
- **WHEN** the model requires an API key
- **THEN** the system SHALL read it from the `VERIDIA_API_KEY` environment variable
