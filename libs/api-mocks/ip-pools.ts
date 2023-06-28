import type { IpPool } from '@oxide/api'

import type { Json } from './json-type'

export const ipPools: Json<IpPool>[] = [
  {
    id: 'eea2c611-8525-4e0e-b798-91cea947bff1',
    description: "Let's go for a swim",
    name: 'mock-ip-pool',
    time_created: new Date().toISOString(),
    time_modified: new Date().toISOString(),
  },
]
