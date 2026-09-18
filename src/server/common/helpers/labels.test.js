import {
  OWNING_ORGANISATION,
  LIFECYCLE_PHASE,
  label,
  phaseTagClass
} from './labels.js'

describe('#label', () => {
  test('returns the human label for a known code', () => {
    expect(label(OWNING_ORGANISATION, 'rural_payments_agency')).toBe(
      'Rural Payments Agency'
    )
    expect(label(LIFECYCLE_PHASE, 'private_beta')).toBe('Private beta')
  })

  test('falls back to the raw code so nothing is hidden', () => {
    expect(label(OWNING_ORGANISATION, 'something_new')).toBe('something_new')
  })

  test('returns an empty string for a missing code', () => {
    expect(label(OWNING_ORGANISATION, undefined)).toBe('')
    expect(label(OWNING_ORGANISATION, null)).toBe('')
  })
})

describe('#phaseTagClass', () => {
  test('maps a phase to its GOV.UK tag colour', () => {
    expect(phaseTagClass('live')).toBe('govuk-tag--green')
    expect(phaseTagClass('retired')).toBe('govuk-tag--red')
  })

  test('defaults to grey for an unknown phase', () => {
    expect(phaseTagClass('mystery')).toBe('govuk-tag--grey')
  })
})
