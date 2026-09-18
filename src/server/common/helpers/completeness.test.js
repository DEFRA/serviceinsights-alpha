import { completeness, fieldCoverage, isPresent } from './completeness.js'

function record(overrides = {}) {
  return {
    id: 'a1',
    name: 'A service',
    description: 'A sufficiently long description of the service.',
    owningOrganisation: 'defra',
    deliveryGroup: 'farming',
    lifecyclePhase: 'alpha',
    primaryUserGroup: 'businesses',
    owner: 'A Owner',
    ownerEmail: 'owner@defra.gov.uk',
    serviceContact: { name: 'A Contact', email: 'contact@defra.gov.uk' },
    ...overrides
  }
}

describe('#isPresent', () => {
  test('treats blank strings and empty arrays as absent', () => {
    expect(isPresent('x')).toBe(true)
    expect(isPresent('  ')).toBe(false)
    expect(isPresent([])).toBe(false)
    expect(isPresent(['x'])).toBe(true)
    expect(isPresent(null)).toBe(false)
    expect(isPresent(undefined)).toBe(false)
  })
})

describe('#completeness', () => {
  test('a fully populated record is complete', () => {
    const c = completeness(record())
    expect(c.complete).toBe(true)
    expect(c.missing).toEqual([])
  })

  test('reports each missing expected field by label', () => {
    const c = completeness(record({ owner: null, ownerEmail: '' }))
    expect(c.complete).toBe(false)
    expect(c.missing).toContain('Owner')
    expect(c.missing).toContain('Owner email')
    expect(c.missingCount).toBe(2)
  })

  test('a service contact needs both a name and an email', () => {
    const c = completeness(record({ serviceContact: { name: 'A Contact' } }))
    expect(c.missing).toContain('Service contact')
  })

  test('a start page is expected only once live or public', () => {
    expect(
      completeness(record({ lifecyclePhase: 'alpha' })).missing
    ).not.toContain('Start page')
    const live = completeness(record({ lifecyclePhase: 'live' }))
    expect(live.missing).toContain('Start page')
    const liveWithPage = completeness(
      record({ lifecyclePhase: 'live', startPageUrl: 'https://example.gov.uk' })
    )
    expect(liveWithPage.missing).not.toContain('Start page')
  })
})

describe('#fieldCoverage', () => {
  test('reports per-field populated counts and percentages', () => {
    const records = [
      record(),
      record({ owner: null, ownerEmail: null, description: null })
    ]
    const coverage = fieldCoverage(records)
    const byLabel = Object.fromEntries(coverage.map((c) => [c.label, c]))

    expect(byLabel['Owning organisation'].present).toBe(2)
    expect(byLabel['Owning organisation'].pct).toBe(100)
    expect(byLabel.Owner.present).toBe(1)
    expect(byLabel.Owner.pct).toBe(50)
    expect(byLabel.Description.present).toBe(1)
  })
})
