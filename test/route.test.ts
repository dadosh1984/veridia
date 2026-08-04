import { describe, expect, it } from 'vitest'
import type { VerifiabilityLevel } from '../src/assess/types.js'
import type { TaskType } from '../src/classify/types.js'
import { mapLevel } from '../src/route/map-level.js'
import { mapType } from '../src/route/map-type.js'
import { buildPlan } from '../src/route/route.js'
import type { RunPlan } from '../src/route/types.js'

const TYPES: TaskType[] = ['bugfix', 'refactor', 'feature', 'doc', 'explore', 'open']
const LEVELS: VerifiabilityLevel[] = [0, 1, 2, 3]

const EXECUTE_VERIFY_STEPS = ['write-failing-test', 'implement']

describe('mapLevel', () => {
  it('maps level 3 to full-tdd with cheapest tier and verifier trust', () => {
    const plan = mapLevel(3)
    expect(plan.depth).toBe('full-tdd')
    expect(plan.tier).toBe('cheapest')
    expect(plan.trust).toContain('verifier')
  })

  it('maps level 2 to tdd-where-possible with mid tier', () => {
    const plan = mapLevel(2)
    expect(plan.depth).toBe('tdd-where-possible')
    expect(plan.tier).toBe('mid')
    expect(plan.trust).toContain('human')
  })

  it('maps level 1 to minimal orchestration with any tier', () => {
    const plan = mapLevel(1)
    expect(plan.depth).toBe('minimal')
    expect(plan.tier).toBe('any')
    expect(plan.trust).toContain('human')
  })

  it('maps level 0 to just-do-it with cheapest tier', () => {
    const plan = mapLevel(0)
    expect(plan.depth).toBe('just-do-it')
    expect(plan.tier).toBe('cheapest')
  })

  it.each(LEVELS)('every level plan includes checks', (level) => {
    expect(mapLevel(level).checks.length).toBeGreaterThan(0)
  })
})

describe('mapType', () => {
  it('explore omits the execute-and-verify TDD steps', () => {
    const steps = mapType('explore').steps
    for (const step of EXECUTE_VERIFY_STEPS) {
      expect(steps).not.toContain(step)
    }
  })

  it('open omits the execute-and-verify TDD steps', () => {
    const steps = mapType('open').steps
    for (const step of EXECUTE_VERIFY_STEPS) {
      expect(steps).not.toContain(step)
    }
  })

  it('bugfix keeps the execute-and-verify TDD steps', () => {
    const steps = mapType('bugfix').steps
    for (const step of EXECUTE_VERIFY_STEPS) {
      expect(steps).toContain(step)
    }
  })

  it('feature and doc each select their own step sets', () => {
    const featureSteps = mapType('feature').steps
    const docSteps = mapType('doc').steps
    expect(featureSteps.length).toBeGreaterThan(0)
    expect(docSteps.length).toBeGreaterThan(0)
    expect(docSteps).not.toContain('write-failing-test')
  })
})

describe('buildPlan', () => {
  it('returns a complete run plan for feature/level 2', () => {
    const plan = buildPlan('feature', 2)
    expect(plan.depth).toBe('tdd-where-possible')
    expect(plan.tier).toBe('mid')
    expect(plan.steps.length).toBeGreaterThan(0)
    expect(plan.checks.length).toBeGreaterThan(0)
  })

  it('is deterministic: same input yields identical plan', () => {
    for (const type of TYPES) {
      for (const level of LEVELS) {
        expect(buildPlan(type, level)).toEqual(buildPlan(type, level))
      }
    }
  })

  it.each(TYPES)('every plan for %s lists steps and checks', (type) => {
    for (const level of LEVELS) {
      const plan: RunPlan = buildPlan(type, level)
      expect(plan.steps.length).toBeGreaterThan(0)
      expect(plan.checks.length).toBeGreaterThan(0)
    }
  })

  it.each(TYPES)('explore-family %s never includes the TDD execute-verify loop', (type) => {
    if (type !== 'explore' && type !== 'open') return
    for (const level of LEVELS) {
      const steps = buildPlan(type, level).steps
      for (const step of EXECUTE_VERIFY_STEPS) {
        expect(steps).not.toContain(step)
      }
    }
  })

  it('bugfix at level 3 includes the full TDD loop', () => {
    const plan = buildPlan('bugfix', 3)
    expect(plan.depth).toBe('full-tdd')
    for (const step of EXECUTE_VERIFY_STEPS) {
      expect(plan.steps).toContain(step)
    }
  })
})
