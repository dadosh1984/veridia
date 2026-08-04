import type { VeridiaConfig } from '../config/config.js'
import { mapLevel } from './map-level.js'
import { type FsLike, probeOracles, realFs } from './probe.js'
import type { Assessment } from './types.js'

/**
 * Assess the verifiability of a target directory by probing for oracles and mapping to a level.
 *
 * @param target - The directory path to assess.
 * @param fsLike - Optional filesystem abstraction (defaults to real filesystem).
 * @param taskHint - Optional task hint that may influence level mapping.
 * @param config - Optional veridia configuration for custom probe definitions.
 * @returns An Assessment containing the verifiability level and detected oracles.
 */
export function assess(target: string, fsLike?: FsLike, taskHint?: string, config?: VeridiaConfig): Assessment {
  const oracles = probeOracles(target, fsLike ?? realFs, config)
  const level = mapLevel(oracles, taskHint)
  return { level, oracles }
}
