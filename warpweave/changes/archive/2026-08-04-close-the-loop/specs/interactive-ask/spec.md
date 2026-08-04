## Purpose

Present clarifying questions to the user via the terminal when verifiability level is 0 or 1, collect answers, and feed them into the pipeline to improve routing and execution decisions.

## ADDED Requirements

### Requirement: Interactive prompt

When level is 0 or 1 and `--auto` is not set, the system SHALL present questions interactively via the terminal and wait for answers.

#### Scenario: Questions displayed
- **WHEN** the ask module generates questions
- **THEN** the system SHALL display each question with numbered multiple-choice options

#### Scenario: User selects answer
- **WHEN** the user enters a number
- **THEN** the system SHALL record the corresponding answer

#### Scenario: Invalid input handled
- **WHEN** the user enters an invalid number or non-numeric input
- **THEN** the system SHALL re-prompt with the same question

### Requirement: Feed answers into pipeline

The system SHALL pass collected answers to the route and execute stages.

#### Scenario: Answer affects routing
- **WHEN** the user answers "yes" to "Do you have tests?"
- **THEN** the route stage SHALL consider the verifiability level as potentially higher

#### Scenario: Answer affects execution
- **WHEN** the user specifies a framework in answer
- **THEN** the execute stage SHALL include that framework context in the plan

### Requirement: Auto mode override

When `--auto` is set, the system SHALL skip interactive prompts and use default answers.

#### Scenario: Auto mode skips prompts
- **WHEN** `--auto` is set
- **THEN** the system SHALL NOT display interactive prompts
- **THEN** the system SHALL use default answers for all questions
