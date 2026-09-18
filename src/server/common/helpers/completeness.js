// A record's "completeness": how many of the fields a full alpha record should
// carry are actually populated. The source directory export never captured the
// ownership and contact fields, so most records are incomplete until the
// management tool fills them in — this makes the gaps visible.

export function isPresent(value) {
  if (value === null || value === undefined) return false
  if (typeof value === 'string') return value.trim() !== ''
  if (Array.isArray(value)) return value.length > 0
  return true
}

function contactPresent(contact) {
  return !!contact && isPresent(contact.name) && isPresent(contact.email)
}

// Fields a complete record is expected to carry, in the order they matter.
const EXPECTED = [
  { key: 'description', label: 'Description' },
  { key: 'owningOrganisation', label: 'Owning organisation' },
  { key: 'deliveryGroup', label: 'Delivery group' },
  { key: 'lifecyclePhase', label: 'Lifecycle phase' },
  { key: 'primaryUserGroup', label: 'Primary user group' },
  { key: 'owner', label: 'Owner' },
  { key: 'ownerEmail', label: 'Owner email' },
  { key: 'serviceContact', label: 'Service contact', present: contactPresent }
]

// A start page is only expected once a service is public or live.
export function expectedFields(record) {
  const fields = EXPECTED.slice()
  if (['public_beta', 'live'].includes(record.lifecyclePhase)) {
    fields.push({ key: 'startPageUrl', label: 'Start page' })
  }
  return fields
}

// Fields to report estate-wide coverage for (a superset of the "expected" set,
// including useful descriptive fields), in display order.
const COVERAGE = [
  { key: 'description', label: 'Description' },
  { key: 'owningOrganisation', label: 'Owning organisation' },
  { key: 'deliveryGroup', label: 'Delivery group' },
  { key: 'lifecyclePhase', label: 'Lifecycle phase' },
  { key: 'type', label: 'Service type' },
  { key: 'programme', label: 'Programme' },
  { key: 'startPageUrl', label: 'Start page' },
  { key: 'primaryUserGroup', label: 'Primary user group' },
  { key: 'owner', label: 'Owner' },
  { key: 'ownerEmail', label: 'Owner email' },
  { key: 'serviceContact', label: 'Service contact', present: contactPresent }
]

// For each coverage field, how many of the given records populate it.
export function fieldCoverage(records) {
  const total = records.length
  return COVERAGE.map((field) => {
    const present = records.filter((record) =>
      field.present
        ? field.present(record[field.key])
        : isPresent(record[field.key])
    ).length
    const pct = total ? Math.round((present / total) * 100) : 0
    return {
      label: field.label,
      present,
      total,
      pct,
      // Rounded to the nearest 5 so the bar width can be a CSS class (the CSP
      // blocks inline style attributes).
      bucket: Math.round(pct / 5) * 5
    }
  })
}

export function completeness(record) {
  const fields = expectedFields(record)
  const missing = fields.filter((field) => {
    const present = field.present
      ? field.present(record[field.key])
      : isPresent(record[field.key])
    return !present
  })
  return {
    total: fields.length,
    present: fields.length - missing.length,
    missing: missing.map((field) => field.label),
    missingCount: missing.length,
    complete: missing.length === 0
  }
}
