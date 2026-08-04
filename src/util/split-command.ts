/**
 * Split a command string into an array of arguments, respecting single and double
 * quotes, backslash escapes, and preserving empty quoted segments.
 *
 * @param command - The command string to split.
 * @returns An array of argument strings.
 */
export function splitCommand(command: string): string[] {
  const parts: string[] = []
  let current = ''
  let inQuote: string | null = null
  let hasToken = false
  for (let i = 0; i < command.length; i++) {
    const ch = command[i]
    if (inQuote) {
      if (ch === '\\' && i + 1 < command.length && (command[i + 1] === inQuote || command[i + 1] === '\\')) {
        current += command[++i]
        hasToken = true
      } else if (ch === inQuote) {
        inQuote = null
      } else {
        current += ch
        hasToken = true
      }
    } else if (ch === '"' || ch === "'") {
      inQuote = ch
      hasToken = true
    } else if (ch === '\\' && i + 1 < command.length) {
      current += command[++i]
      hasToken = true
    } else if (ch === ' ' || ch === '\t') {
      if (hasToken) {
        parts.push(current)
        current = ''
        hasToken = false
      }
    } else {
      current += ch
      hasToken = true
    }
  }
  if (hasToken) parts.push(current)
  return parts
}
