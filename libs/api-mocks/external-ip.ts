import type { ExternalIp } from '@oxide/api'

import type { Json } from './json-type'

// TODO: this type represents the API response, but we need to mock more
// structure in order to be able to look up IPs for a particular instance
export const externalIps: Json<ExternalIp[]> = [
  {
    ip: '123.4.56.7',
    kind: 'ephemeral',
  },
]
