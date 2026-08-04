/** Options for determining whether to prompt the user interactively. */
export interface PromptResolve {
  /** If true, skip interactive prompts. */
  noInteractive?: boolean
  /** Whether stdin is a TTY (defaults to process.stdin.isTTY). */
  isTTY?: boolean
  /** Environment variables to check (defaults to process.env). */
  env?: NodeJS.ProcessEnv
}

/**
 * Determine whether the user should be prompted interactively.
 * Returns false if noInteractive is set, VERIDIA_NO_INTERACTIVE is set,
 * or CI environment is detected. Returns true only if stdin is a TTY.
 *
 * @param options - Optional overrides for the check.
 * @returns True if prompting is appropriate, false otherwise.
 */
export function shouldPrompt(options: PromptResolve = {}): boolean {
  if (options.noInteractive === true) return false
  const env = options.env ?? process.env
  const isTTY = options.isTTY ?? !!process.stdin.isTTY
  if (env.VERIDIA_NO_INTERACTIVE === '1') return false
  if ('CI' in env) return false
  return isTTY
}
