/**
 * Split a command string into an array of arguments, respecting single and double quotes.
 *
 * @param command - The command string to split.
 * @returns An array of argument strings.
 */
export function splitCommand(command: string): string[] {
  const parts: string[] = []
  let current = ''
  let inQuote: string | null = null
  for (const ch of command) {
    if (inQuote) {
      if (ch === inQuote) {
        inQuote = null
      } else {
        current += ch
      }
    } else if (ch === '"' || ch === "'") {
      inQuote = ch
    } else if (ch === ' ' || ch === '\t') {
      if (current) {
        parts.push(current)
        current = ''
      }
    } else {
      current += ch
    }
  }
  if (current) parts.push(current)
  return parts
}
