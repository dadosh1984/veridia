export function mutate(input: string): string[] {
  if (input.length === 0) return [];
  const mutations: string[] = [];
  const seen = new Set<string>();

  function add(m: string): void {
    if (m !== input && !seen.has(m)) {
      seen.add(m);
      mutations.push(m);
    }
  }

  add(input.replace(/\btrue\b/g, 'false'));
  add(input.replace(/\bfalse\b/g, 'true'));
  add(input.replace(/===/g, '!=='));
  add(input.replace(/!==/g, '==='));
  add(input.replace(/>/g, '<'));
  add(input.replace(/</g, '>'));
  add(input.replace(/&&/g, '||'));
  add(input.replace(/\|\|/g, '&&'));
  add(input.replace(/\breturn\b/g, 'return null &&'));
  add(input.replace(/\bconst\b/g, 'let'));

  const lines = input.split('\n');
  if (lines.length > 1) {
    add(lines.slice(0, -1).join('\n'));
  }

  return mutations;
}

export function computeSensitivity(correctOutput: string, runOracle: (output: string) => number): number {
  const mutations = mutate(correctOutput);
  if (mutations.length === 0) return 0;
  const caught = mutations.filter((m) => runOracle(m) !== 0).length;
  return caught / mutations.length;
}
