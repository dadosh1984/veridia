import type { DelegationMode } from '../execute/types.js'

/** Information about a supported AI agent that can host veridia commands. */
export interface AgentInfo {
  /** Unique agent identifier. */
  id: string
  /** Human-readable agent name. */
  name: string
  /** The agent's configuration directory name (e.g. ".opencode"). */
  configDir: string
  /** The prefix used to invoke commands (e.g. "/" or "@"). */
  invocationPrefix: string
  /** The invocation style: 'namespaced' (e.g. /veridia:command) or 'flat' (e.g. /veridia-command). */
  invocationStyle: 'namespaced' | 'flat'
  /** Whether this agent only supports skill-based commands. */
  skillsOnly: boolean
  /** The delegation modes this agent supports. */
  delegationModes: DelegationMode[]
  /** Whether the agent can write files. */
  canWriteFiles: boolean
  /** Whether the agent can run shell commands. */
  canRunShell: boolean
  /** Whether the agent can call AI models directly. */
  canCallModels: boolean
}
