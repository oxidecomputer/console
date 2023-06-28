import type { IpPool, IpPoolRange } from '@oxide/api'

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

// TODO: take out the explicit ip_pool_id here once it's added in the API
export const ipPoolRanges: (Json<IpPoolRange> & { ip_pool_id: string })[] = [
  {
    id: 'a8e56bd3-5ddd-4e7d-b17c-cbfe7f7c994a',
    ip_pool_id: ipPools[0].id,
    // TODO: confirm this type is right!
    range: { first: '192.168.0.1', last: '192.168.0.2' },
    time_created: new Date().toISOString(),
  },
]
