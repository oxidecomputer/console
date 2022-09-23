import type { Silo } from '@oxide/api'

import type { Json } from './json-type'

export const silos: Json<Silo>[] = [
  {
    id: 'default-silo-uuid',
    name: 'default-silo',
    description: 'a fake default silo',
    time_created: new Date(2021, 3, 1).toISOString(),
    time_modified: new Date(2021, 4, 2).toISOString(),
    discoverable: true,
    user_provision_type: 'jit',
  },
]

export const defaultSilo = silos[0]
