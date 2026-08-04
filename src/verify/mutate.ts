/**
 * Generate a set of mutated versions of the input string by applying common
 * code mutation operators (e.g. swapping true/false, flipping operators, removing lines).
 *
 * @param input - The source code string to mutate.
 * @returns An array of unique mutated strings.
 */
export function mutate(input: string): string[] {
  if (input.length === 0) return []
  const mutations: string[] = []
  const seen = new Set<string>()

  function add(m: string): void {
    if (m !== input && !seen.has(m)) {
      seen.add(m)
      mutations.push(m)
    }
  }

  add(input.replace(/\btrue\b/g, 'false'))
  add(input.replace(/\bfalse\b/g, 'true'))
  add(input.replace(/===/g, '!=='))
  add(input.replace(/!==/g, '==='))
  add(input.replace(/>/g, '<'))
  add(input.replace(/</g, '>'))
  add(input.replace(/&&/g, '||'))
  add(input.replace(/\|\|/g, '&&'))
  add(input.replace(/\breturn\b/g, 'return null &&'))
  add(input.replace(/\bconst\b/g, 'let'))

  const lines = input.split('\n')
  if (lines.length > 1) {
    add(lines.slice(0, -1).join('\n'))
  }

  return mutations
}

/**
 * Compute the sensitivity of an oracle by measuring what fraction of mutations it catches.
 *
 * @param correctOutput - The correct output string to mutate.
 * @param runOracle - A function that runs the oracle on a given output and returns 0 for pass, non-zero for fail.
 * @returns A sensitivity score between 0 and 1.
 */
export function computeSensitivity(correctOutput: string, runOracle: (output: string) => number): number {
  const mutations = mutate(correctOutput)
  if (mutations.length === 0) return 0
  const caught = mutations.filter((m) => runOracle(m) !== 0).length
  return caught / mutations.length
}
