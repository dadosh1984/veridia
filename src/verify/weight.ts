import { type FsLike, realFs } from '../assess/probe.js'
import type { OracleKind } from '../assess/types.js'
import { hasMeaningfulTests } from '../util/test-files.js'

const KIND_WEIGHTS: Record<OracleKind, number> = {
  'test-runner': 3,
  'type-check': 2,
  lint: 1,
  ci: 0,
  'test-content': 0,
  'human-review': 0,
  'dead-code': 1,
  bundler: 1,
}

/**
 * Check whether tests in the target directory are weak (no meaningful test assertions).
 *
 * @param target - The directory path to check.
 * @param fsLike - Optional filesystem abstraction (defaults to real filesystem).
 * @returns True if tests are weak or absent, false if meaningful tests exist.
 */
export function isTestsWeak(target: string, fsLike: FsLike = realFs): boolean {
  return !hasMeaningfulTests(fsLike, target)
}

/**
 * Get the base weight for an oracle kind, with optional custom weight overrides.
 *
 * @param kind - The oracle kind to get the weight for.
 * @param weights - Optional custom weight map to override defaults.
 * @returns The base weight value.
 */
export function baseWeight(kind: OracleKind, weights?: Record<string, number>): number {
  if (weights && weights[kind] !== undefined) return weights[kind]
  return KIND_WEIGHTS[kind]
}

/**
 * Calibrate a base weight by multiplying it with sensitivity and precision factors.
 *
 * @param base - The base weight to calibrate.
 * @param sensitivity - The sensitivity factor (0-1).
 * @param precision - The precision factor (0-1).
 * @returns The calibrated weight.
 */
export function calibrateWeight(base: number, sensitivity: number, precision: number): number {
  return base * sensitivity * precision
}
