import { servicesController } from './controller.js'

export const services = {
  plugin: {
    name: 'services',
    register(server) {
      server.route([
        {
          method: 'GET',
          path: '/',
          ...servicesController
        }
      ])
    }
  }
}
