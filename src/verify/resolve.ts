import path from 'node:path';
import { stripBom } from '../util/strip-bom.js';
import type { OracleKind } from '../assess/types.js';
import { realFs, type FsLike } from '../assess/probe.js';

export interface ResolvedCommand {
  kind: OracleKind;
  command: string;
}

interface ScriptSource {
  kind: OracleKind;
  scriptKeys: string[];
  fallback: string;
}

const SOURCES: ScriptSource[] = [
  { kind: 'test-runner', scriptKeys: ['test'], fallback: 'vitest run' },
  { kind: 'type-check', scriptKeys: ['typecheck', 'type-check'], fallback: 'tsc --noEmit' },
  { kind: 'lint', scriptKeys: ['lint'], fallback: 'eslint .' },
  { kind: 'human-review', scriptKeys: [], fallback: '' },
];

const CI_KIND: OracleKind = 'ci';

function readScript(target: string, keys: string[], fsLike: FsLike): string | undefined {
  try {
    const raw = fsLike.readFileSync(path.join(target, 'package.json'));
    const pkg = JSON.parse(stripBom(raw)) as { scripts?: Record<string, string> };
    const scripts = pkg.scripts ?? {};
    for (const key of keys) {
      if (typeof scripts[key] === 'string') return scripts[key];
    }
  } catch {
    return undefined;
  }
  return undefined;
}

export function resolveCommands(kinds: OracleKind[], target: string, fsLike: FsLike = realFs): ResolvedCommand[] {
  const resolved: ResolvedCommand[] = [];
  for (const kind of kinds) {
    if (kind === CI_KIND) continue;
    const source = SOURCES.find((s) => s.kind === kind);
    if (source === undefined) continue;
    const command = readScript(target, source.scriptKeys, fsLike) ?? source.fallback;
    resolved.push({ kind, command });
  }
  return resolved;
}
