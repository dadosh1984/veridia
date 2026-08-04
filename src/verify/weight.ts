import type { OracleKind } from '../assess/types.js';
import { realFs, type FsLike } from '../assess/probe.js';
import { hasMeaningfulTests } from '../util/test-files.js';

const KIND_WEIGHTS: Record<OracleKind, number> = {
  'test-runner': 3,
  'type-check': 2,
  lint: 1,
  ci: 0,
  'test-content': 0,
};

export function isTestsWeak(target: string, fsLike: FsLike = realFs): boolean {
  return !hasMeaningfulTests(fsLike, target);
}

export function baseWeight(kind: OracleKind, weights?: Record<string, number>): number {
  if (weights && weights[kind] !== undefined) return weights[kind];
  return KIND_WEIGHTS[kind];
}

export function calibrateWeight(base: number, sensitivity: number, precision: number): number {
  return base * sensitivity * precision;
}