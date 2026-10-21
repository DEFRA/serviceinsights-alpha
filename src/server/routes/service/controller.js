import { fetchJson } from '#/server/common/helpers/backend.js'
import { esc } from '#/server/common/helpers/format.js'
import {
  OWNING_ORGANISATION,
  DELIVERY_GROUP,
  LIFECYCLE_PHASE,
  PRIMARY_USER_GROUP,
  DIGITAL_SERVICE_TYPE,
  PLATFORM,
  SENSITIVITY,
  label,
  phaseTagClass
} from '#/server/common/helpers/labels.js'
import {
  completeness,
  isPresent
} from '#/server/common/helpers/completeness.js'

// A muted placeholder makes an empty field visible rather than hiding the row.
const EMPTY = { html: '<span class="app-empty">Not provided</span>' }

const textValue = (v) => (isPresent(v) ? { text: v } : EMPTY)
const labelValue = (map, code, fallback) =>
  isPresent(code) || isPresent(fallback)
    ? { text: label(map, code) || fallback }
    : EMPTY
const emailValue = (v) =>
  isPresent(v)
    ? {
        html: `<a class="govuk-link" href="mailto:${esc(v)}">${esc(v)}</a>`
      }
    : EMPTY
const linkValue = (url) =>
  isPresent(url)
    ? {
        html: `<a class="govuk-link" href="${esc(url)}" rel="noopener noreferrer">${esc(url)}</a>`
      }
    : EMPTY

function contactValue(contact) {
  if (!contact || (!isPresent(contact.name) && !isPresent(contact.email))) {
    return EMPTY
  }
  return {
    html: [
      esc(contact.name),
      isPresent(contact.type)
        ? `<br><span class="govuk-hint govuk-!-display-inline">${esc(contact.type)}</span>`
        : '',
      isPresent(contact.email)
        ? `<br><a class="govuk-link" href="mailto:${esc(contact.email)}">${esc(contact.email)}</a>`
        : ''
    ].join('')
  }
}

export const serviceController = {
  async handler(request, h) {
    const doc = await fetchJson(
      `/service-records/${encodeURIComponent(request.params.id)}`
    )
    if (!doc) {
      return h.view('not-found', { pageTitle: 'Service not found' }).code(404)
    }

    const rows = (pairs) =>
      pairs.map(([key, value]) => ({ key: { text: key }, value }))

    // Core: the fields that define the service in the directory.
    const coreRows = rows([
      ['Description', textValue(doc.description)],
      [
        'Owning organisation',
        labelValue(OWNING_ORGANISATION, doc.owningOrganisation)
      ],
      ['Delivery group', labelValue(DELIVERY_GROUP, doc.deliveryGroup)],
      [
        'Primary user group',
        labelValue(
          PRIMARY_USER_GROUP,
          doc.primaryUserGroup,
          doc.primaryUserGroupOther
        )
      ],
      ['Owner', textValue(doc.owner)],
      ['Owner email', emailValue(doc.ownerEmail)],
      ['Service contact', contactValue(doc.serviceContact)],
      ['Lifecycle phase', labelValue(LIFECYCLE_PHASE, doc.lifecyclePhase)],
      ['Start page', linkValue(doc.startPageUrl)],
      ['Security classification', labelValue(SENSITIVITY, doc.sensitivity)]
    ])

    // Additional: secondary and background fields carried over from the
    // service directory (the four *Id/Code fields are "background" in the schema).
    const extraRows = rows([
      ['Directorate', textValue(doc.directorate)],
      ['Programme', textValue(doc.programme)],
      ['Service type', textValue(doc.type)],
      [
        'Digital service type',
        labelValue(DIGITAL_SERVICE_TYPE, doc.digitalServiceType)
      ],
      ['Platform', labelValue(PLATFORM, doc.platform, doc.platformOther)],
      ['Phase start date', textValue(doc.lifecyclePhaseStartDate)],
      ['Phase end date', textValue(doc.lifecyclePhaseEndDate)],
      ['Data sensitivity', labelValue(SENSITIVITY, doc.dataSensitivity)],
      ['Web register ID', textValue(doc.webRegisterId)],
      ['Project Online code', textValue(doc.projectOnlineCode)],
      ['SOP code', textValue(doc.sopCode)],
      ['ServiceNow ID', textValue(doc.serviceNowId)]
    ])

    const s = {
      name: doc.name,
      description: doc.description,
      owningOrganisation: label(OWNING_ORGANISATION, doc.owningOrganisation),
      phaseName: label(LIFECYCLE_PHASE, doc.lifecyclePhase),
      phaseTagClass: phaseTagClass(doc.lifecyclePhase),
      updatedAt: doc.audit?.updatedAt
    }

    return h.view('service/index', {
      pageTitle: s.name,
      s,
      coreRows,
      extraRows,
      completeness: completeness(doc)
    })
  }
}
