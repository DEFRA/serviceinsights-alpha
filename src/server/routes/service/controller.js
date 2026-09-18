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

export const serviceController = {
  async handler(request, h) {
    const doc = await fetchJson(
      `/service-records/${encodeURIComponent(request.params.id)}`
    )
    if (!doc) {
      return h.view('not-found', { pageTitle: 'Service not found' }).code(404)
    }

    const text = (v) => (v ? { text: v } : null)
    const link = (url) =>
      url
        ? {
            html: `<a class="govuk-link" href="${esc(url)}" rel="noopener noreferrer">${esc(url)}</a>`
          }
        : null

    const contact = doc.serviceContact
    const contactValue = contact
      ? {
          html: [
            esc(contact.name),
            contact.type
              ? `<br><span class="govuk-hint govuk-!-display-inline">${esc(contact.type)}</span>`
              : '',
            contact.email
              ? `<br><a class="govuk-link" href="mailto:${esc(contact.email)}">${esc(contact.email)}</a>`
              : ''
          ].join('')
        }
      : null

    const summaryRows = [
      [
        'Owning organisation',
        text(label(OWNING_ORGANISATION, doc.owningOrganisation))
      ],
      ['Delivery group', text(label(DELIVERY_GROUP, doc.deliveryGroup))],
      ['Directorate', text(doc.directorate)],
      ['Programme', text(doc.programme)],
      ['Service type', text(doc.type)],
      [
        'Digital service type',
        text(label(DIGITAL_SERVICE_TYPE, doc.digitalServiceType))
      ],
      [
        'Primary user group',
        text(
          label(PRIMARY_USER_GROUP, doc.primaryUserGroup) ||
            doc.primaryUserGroupOther
        )
      ],
      ['Owner', text(doc.owner)],
      [
        'Owner email',
        doc.ownerEmail
          ? {
              html: `<a class="govuk-link" href="mailto:${esc(doc.ownerEmail)}">${esc(doc.ownerEmail)}</a>`
            }
          : null
      ],
      ['Service contact', contactValue],
      ['Platform', text(label(PLATFORM, doc.platform) || doc.platformOther)],
      ['Security classification', text(label(SENSITIVITY, doc.sensitivity))],
      ['Data sensitivity', text(label(SENSITIVITY, doc.dataSensitivity))],
      ['Phase start date', text(doc.lifecyclePhaseStartDate)],
      ['Phase end date', text(doc.lifecyclePhaseEndDate)],
      ['Start page', link(doc.startPageUrl)]
    ]
      .filter(([, value]) => value)
      .map(([key, value]) => ({ key: { text: key }, value }))

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
      summaryRows
    })
  }
}
