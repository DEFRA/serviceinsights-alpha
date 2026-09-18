import { vi } from 'vitest'

import { servicesController } from './controller.js'

const records = [
  {
    id: 'a1',
    name: 'Record your catch',
    owningOrganisation: 'marine_management_organisation',
    deliveryGroup: 'farming',
    lifecyclePhase: 'live'
  },
  {
    id: 'b2',
    name: 'Apply for a grant',
    owningOrganisation: 'rural_payments_agency',
    deliveryGroup: 'farming',
    lifecyclePhase: 'alpha'
  }
]

function mockH() {
  return { view: vi.fn((template, model) => ({ template, model })) }
}

describe('#servicesController', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => records
      })
    )
  })

  afterEach(() => vi.unstubAllGlobals())

  test('lists every record with humanised columns', async () => {
    const h = mockH()
    await servicesController.handler({ query: {} }, h)
    const model = h.view.mock.calls[0][1]

    expect(model.totalCount).toBe(2)
    expect(model.shownCount).toBe(2)
    expect(model.rows).toHaveLength(2)
    // Organisation column is the label, not the raw code.
    expect(model.rows[0][1].text).toBe('Marine Management Organisation')
    // Phase renders as a GOV.UK tag.
    expect(model.rows[0][3].html).toContain('govuk-tag--green')
  })

  test('filters by phase', async () => {
    const h = mockH()
    await servicesController.handler({ query: { phase: 'alpha' } }, h)
    const model = h.view.mock.calls[0][1]

    expect(model.shownCount).toBe(1)
    expect(model.totalCount).toBe(2)
    expect(model.filtered).toBe(true)
    expect(model.rows[0][0].html).toContain('Apply for a grant')
  })

  test('searches across name and organisation', async () => {
    const h = mockH()
    await servicesController.handler({ query: { q: 'catch' } }, h)
    expect(h.view.mock.calls[0][1].shownCount).toBe(1)
  })

  test('only offers filter options present in the data', async () => {
    const h = mockH()
    await servicesController.handler({ query: {} }, h)
    const model = h.view.mock.calls[0][1]
    const orgValues = model.orgItems.map((i) => i.value)

    expect(orgValues).toContain('marine_management_organisation')
    expect(orgValues).toContain('rural_payments_agency')
    // Organisations with no records are not offered.
    expect(orgValues).not.toContain('forestry_commission')
  })
})
