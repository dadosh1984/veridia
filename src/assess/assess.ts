import { mapLevel } from './map-level.js';
import { probeOracles, realFs, type FsLike } from './probe.js';
import type { Assessment } from './types.js';
import type { VeridiaConfig } from '../config/config.js';

export function assess(target: string, fsLike?: FsLike, taskHint?: string, config?: VeridiaConfig): Assessment {
  const oracles = probeOracles(target, fsLike ?? realFs, config);
  const level = mapLevel(oracles, taskHint);
  return { level, oracles };
}
