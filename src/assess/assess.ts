import { mapLevel } from './map-level.js';
import { probeOracles, realFs, type FsLike } from './probe.js';
import type { Assessment } from './types.js';

export function assess(target: string, fsLike?: FsLike, taskHint?: string): Assessment {
  const oracles = probeOracles(target, fsLike ?? realFs);
  const level = mapLevel(oracles, taskHint);
  return { level, oracles };
}
