import { fetchJson } from '#/server/common/helpers/backend.js'
import { esc } from '#/server/common/helpers/format.js'
import {
  OWNING_ORGANISATION,
  DELIVERY_GROUP,
  LIFECYCLE_PHASE,
  label,
  phaseTagClass
} from '#/server/common/helpers/labels.js'

// Build the options for a filter <select> from the values actually present in
// the data, so we never offer an empty filter.
function selectItems(allText, map, present, selected) {
  const items = [{ value: '', text: allText }]
  for (const [value, text] of Object.entries(map)) {
    if (present.has(value)) {
      items.push({ value, text, selected: value === selected })
    }
  }
  return items
}

export const servicesController = {
  async handler(request, h) {
    const q = (request.query.q || '').trim()
    const org = (request.query.org || '').trim()
    const phase = (request.query.phase || '').trim()

    const all = (await fetchJson('/service-records?limit=1000')) || []

    const orgsPresent = new Set(all.map((s) => s.owningOrganisation))
    const phasesPresent = new Set(all.map((s) => s.lifecyclePhase))

    const needle = q.toLowerCase()
    const filtered = all.filter((s) => {
      if (org && s.owningOrganisation !== org) return false
      if (phase && s.lifecyclePhase !== phase) return false
      if (needle) {
        const haystack = [
          s.name,
          label(OWNING_ORGANISATION, s.owningOrganisation),
          label(DELIVERY_GROUP, s.deliveryGroup)
        ]
          .join(' ')
          .toLowerCase()
        if (!haystack.includes(needle)) return false
      }
      return true
    })

    const rows = filtered.map((s) => {
      const phaseTag = s.lifecyclePhase
        ? `<strong class="govuk-tag ${phaseTagClass(s.lifecyclePhase)}">${esc(label(LIFECYCLE_PHASE, s.lifecyclePhase))}</strong>`
        : ''
      return [
        {
          html: `<a class="govuk-link" href="/service/${esc(s.id)}">${esc(s.name)}</a>`
        },
        { text: label(OWNING_ORGANISATION, s.owningOrganisation) },
        { text: label(DELIVERY_GROUP, s.deliveryGroup) },
        { html: phaseTag }
      ]
    })

    return h.view('services/index', {
      pageTitle: 'Services',
      q,
      rows,
      orgItems: selectItems(
        'All organisations',
        OWNING_ORGANISATION,
        orgsPresent,
        org
      ),
      phaseItems: selectItems(
        'All phases',
        LIFECYCLE_PHASE,
        phasesPresent,
        phase
      ),
      shownCount: filtered.length,
      totalCount: all.length,
      filtered: Boolean(q || org || phase)
    })
  }
}
