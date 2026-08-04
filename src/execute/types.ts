import type { OracleKind, VerifiabilityLevel } from '../assess/types.js'
import type { TaskType } from '../classify/types.js'
import type { ModelTier, OrchestrationDepth } from '../route/types.js'

/** How the execution plan is delegated to the host agent. */
export type DelegationMode = 'stdout' | 'file' | 'shell'

/** A single step in an execution plan. */
export interface ExecutionStep {
  /** Unique identifier for the step. */
  id: string
  /** Human-readable description of the action to perform. */
  action: string
  /** Optional list of file paths relevant to this step. */
  files?: string[]
  /** Optional list of gate identifiers to run during this step. */
  gates?: string[]
}

/** A verification gate that must pass for the plan to succeed. */
export interface VerificationGate {
  /** Unique identifier for the gate. */
  id: string
  /** The shell command to execute for this gate. */
  command: string
  /** The oracle kind this gate belongs to. */
  kind: OracleKind
}

/** A complete execution plan for a veridia task. */
export interface ExecutionPlan {
  /** Protocol identifier for the execution plan format. */
  protocol: 'veridia/execution-plan/v1'
  /** The original task description. */
  task: string
  /** The classified task type. */
  type: TaskType
  /** The assessed verifiability level. */
  level: VerifiabilityLevel
  /** The plan details. */
  plan: {
    /** The orchestration depth. */
    depth: OrchestrationDepth
    /** The model tier to use. */
    tier: ModelTier
    /** The ordered list of execution steps. */
    steps: ExecutionStep[]
    /** The verification gates to run. */
    gates: VerificationGate[]
  }
  /** Metadata about the plan generation. */
  metadata: {
    /** The detected host agent ID. */
    host: string
    /** ISO timestamp of when the plan was generated. */
    generatedAt: string
  }
}

/** Information about a detected host AI agent. */
export interface HostAgentInfo {
  /** Unique agent identifier. */
  id: string
  /** Human-readable agent name. */
  name: string
  /** The delegation modes this agent supports. */
  delegationModes: DelegationMode[]
  /** Whether the agent can write files. */
  canWriteFiles: boolean
  /** Whether the agent can run shell commands. */
  canRunShell: boolean
  /** Whether the agent can call AI models directly. */
  canCallModels: boolean
}

/** The result of executing a plan or command. */
export interface ExecuteResult {
  /** The exit code (0 for success). */
  exitCode: number
  /** Standard output content. */
  stdout: string
  /** Standard error content. */
  stderr: string
}
