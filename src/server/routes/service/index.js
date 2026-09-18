import { serviceController } from './controller.js'

export const service = {
  plugin: {
    name: 'service',
    register(server) {
      server.route([
        {
          method: 'GET',
          path: '/service/{id}',
          ...serviceController
        }
      ])
    }
  }
}
