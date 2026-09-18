import { fetchJson } from '#/server/common/helpers/backend.js'
import { esc } from '#/server/common/helpers/format.js'
import {
  OWNING_ORGANISATION,
  DELIVERY_GROUP,
  LIFECYCLE_PHASE,
  label,
  phaseTagClass
} from '#/server/common/helpers/labels.js'
import {
  completeness,
  fieldCoverage
} from '#/server/common/helpers/completeness.js'

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

function completenessCell(c) {
  if (c.complete) {
    return {
      html: '<strong class="govuk-tag govuk-tag--green">Complete</strong>'
    }
  }
  return {
    html: `<strong class="govuk-tag govuk-tag--grey">${c.missingCount} missing</strong>`
  }
}

export const servicesController = {
  async handler(request, h) {
    const q = (request.query.q || '').trim()
    const org = (request.query.org || '').trim()
    const phase = (request.query.phase || '').trim()
    const complete = (request.query.complete || '').trim()

    const all = (await fetchJson('/service-records?limit=1000')) || []

    const orgsPresent = new Set(all.map((s) => s.owningOrganisation))
    const phasesPresent = new Set(all.map((s) => s.lifecyclePhase))

    const needle = q.toLowerCase()
    const filtered = all.filter((s) => {
      if (org && s.owningOrganisation !== org) return false
      if (phase && s.lifecyclePhase !== phase) return false
      if (complete === 'complete' && !completeness(s).complete) return false
      if (complete === 'incomplete' && completeness(s).complete) return false
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
        { html: phaseTag },
        completenessCell(completeness(s))
      ]
    })

    const incompleteTotal = all.filter((s) => !completeness(s).complete).length

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
      completeItems: [
        { value: '', text: 'All services' },
        {
          value: 'incomplete',
          text: 'Incomplete only',
          selected: complete === 'incomplete'
        },
        {
          value: 'complete',
          text: 'Complete only',
          selected: complete === 'complete'
        }
      ],
      coverage: fieldCoverage(all),
      shownCount: filtered.length,
      totalCount: all.length,
      incompleteTotal,
      filtered: Boolean(q || org || phase || complete)
    })
  }
}
