/** A clarifying question to ask the user during the ask phase. */
export interface ClarifyingQuestion {
  /** Unique identifier for the question. */
  id: string
  /** The question text to display to the user. */
  prompt: string
  /** Available answer options for the question. */
  options: string[]
}

/** The result of the ask phase, containing questions and optional answers. */
export interface AskResult {
  /** The list of clarifying questions generated. */
  questions: ClarifyingQuestion[]
  /** Optional map of question IDs to user-provided answers. */
  answers?: Record<string, string>
}
