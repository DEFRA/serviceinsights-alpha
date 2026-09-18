// Human-readable labels for the service-record controlled vocabularies. The
// store holds machine codes (e.g. `rural_payments_agency`); the reader shows
// the label. Keys mirror the enums in the store's service-record schema.

export const OWNING_ORGANISATION = {
  defra: 'Defra',
  environment_agency: 'Environment Agency',
  natural_england: 'Natural England',
  rural_payments_agency: 'Rural Payments Agency',
  animal_and_plant_health_agency: 'Animal and Plant Health Agency',
  forestry_commission: 'Forestry Commission',
  marine_management_organisation: 'Marine Management Organisation',
  centre_for_environment_fisheries_and_aquaculture_science:
    'Centre for Environment, Fisheries and Aquaculture Science',
  veterinary_medicines_directorate: 'Veterinary Medicines Directorate',
  other: 'Other'
}

export const DELIVERY_GROUP = {
  waste_and_circular_economy: 'Waste and circular economy',
  nature_recovery: 'Nature recovery',
  animal_and_plant_health: 'Animal and plant health',
  environmental_quality: 'Environmental quality',
  farming: 'Farming',
  trade_and_eu_reset: 'Trade and EU reset',
  livestock: 'Livestock',
  planning: 'Planning',
  water: 'Water',
  floods_incidents_and_asset_management:
    'Floods, incidents and asset management'
}

export const LIFECYCLE_PHASE = {
  discovery: 'Discovery',
  alpha: 'Alpha',
  private_beta: 'Private beta',
  public_beta: 'Public beta',
  live: 'Live',
  retired: 'Retired'
}

export const PRIMARY_USER_GROUP = {
  citizens: 'Citizens',
  businesses: 'Businesses',
  internal_staff: 'Internal staff',
  other_government: 'Other government',
  other: 'Other'
}

export const DIGITAL_SERVICE_TYPE = {
  transactional: 'Transactional',
  information: 'Information',
  user_centred_information_service: 'User-centred information service'
}

export const PLATFORM = {
  cdp: 'CDP',
  legacy: 'Legacy',
  third_party: 'Third party',
  other: 'Other'
}

export const SENSITIVITY = {
  official: 'OFFICIAL',
  official_sensitive: 'OFFICIAL-SENSITIVE',
  secret: 'SECRET'
}

// GOV.UK tag colour for a lifecycle phase.
const PHASE_TAG_CLASS = {
  discovery: 'govuk-tag--grey',
  alpha: 'govuk-tag--yellow',
  private_beta: 'govuk-tag--blue',
  public_beta: 'govuk-tag--turquoise',
  live: 'govuk-tag--green',
  retired: 'govuk-tag--red'
}

/** Look up a label, falling back to the raw code so nothing is hidden. */
export function label(map, code) {
  if (!code) return ''
  return map[code] || code
}

export const phaseTagClass = (code) =>
  PHASE_TAG_CLASS[code] || 'govuk-tag--grey'
