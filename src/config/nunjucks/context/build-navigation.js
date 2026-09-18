export function buildNavigation(request) {
  return [
    {
      text: 'Services',
      href: '/',
      current: request?.path === '/' || request?.path?.startsWith('/service')
    }
  ]
}
