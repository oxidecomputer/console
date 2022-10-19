import type { Silo } from '@oxide/api'

import type { Json } from './json-type'

export const silos: Json<Silo>[] = [
  {
    id: '6d3a9c06-475e-4f75-b272-c0d0e3f980fa',
    name: 'default-silo',
    description: 'a fake default silo',
    time_created: new Date(2021, 3, 1).toISOString(),
    time_modified: new Date(2021, 4, 2).toISOString(),
    discoverable: true,
    identity_mode: 'saml_jit',
  },
]

export const defaultSilo = silos[0]
