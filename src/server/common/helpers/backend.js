import { config } from '#/config/config.js'

// Fetch JSON from the serviceinsights-store API. In CDP the call goes
// service-to-service; locally it hits the backendApiUrl default. Returns null
// on 404 so controllers can render a not-found page.
export async function fetchJson(path) {
  const url = `${config.get('backendApiUrl')}${path}`
  const response = await fetch(url)
  if (response.status === 404) {
    return null
  }
  if (!response.ok) {
    throw new Error(
      `Backend request failed: ${path} returned ${response.status}`
    )
  }
  return response.json()
}
