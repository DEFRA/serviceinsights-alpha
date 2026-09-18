import { buildNavigation } from './build-navigation.js'

function mockRequest(options) {
  return { ...options }
}

describe('#buildNavigation', () => {
  test('Should provide expected navigation details', () => {
    expect(
      buildNavigation(mockRequest({ path: '/non-existent-path' }))
    ).toEqual([
      {
        current: false,
        text: 'Services',
        href: '/'
      }
    ])
  })

  test('Should highlight Services on the home path', () => {
    expect(buildNavigation(mockRequest({ path: '/' }))).toEqual([
      {
        current: true,
        text: 'Services',
        href: '/'
      }
    ])
  })

  test('Should highlight Services on a service detail path', () => {
    expect(
      buildNavigation(mockRequest({ path: '/service/abc' }))[0].current
    ).toBe(true)
  })
})
