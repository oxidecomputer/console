import type { Silo } from '@oxide/api'

import type { Json } from './json-type'
import { genId } from './msw/util'

export const silos: Json<Silo>[] = [
  {
    id: genId('default-silo'),
    name: 'default-silo',
    description: 'a fake default silo',
    time_created: new Date(2021, 3, 1).toISOString(),
    time_modified: new Date(2021, 4, 2).toISOString(),
    discoverable: true,
    identity_mode: 'saml_jit',
  },
]

export const defaultSilo = silos[0]
