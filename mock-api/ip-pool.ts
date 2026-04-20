/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { type IpPool, type IpPoolRange, type IpPoolSiloLink } from '@oxide/api'

import type { Json } from './json-type'
import { defaultSilo, myriadSilo, pelerinesSilo, thraxSilo } from './silo'

export const ipPool1: Json<IpPool> = {
  id: '69b5c583-74a9-451a-823d-0741c1ec66e2',
  name: 'ip-pool-1',
  description: 'public IPs',
  time_created: new Date().toISOString(),
  time_modified: new Date().toISOString(),
  ip_version: 'v4',
  pool_type: 'unicast',
}

export const ipPool2: Json<IpPool> = {
  id: 'af2fbe06-b21d-4364-96b7-a58220bc3242',
  name: 'ip-pool-2',
  description: 'VPN IPs',
  time_created: new Date().toISOString(),
  time_modified: new Date().toISOString(),
  ip_version: 'v6',
  pool_type: 'unicast',
}

export const ipPool3: Json<IpPool> = {
  id: '8929a9ec-03d7-4027-8bf3-dda76627de07',
  name: 'ip-pool-3',
  description: '',
  time_created: new Date().toISOString(),
  time_modified: new Date().toISOString(),
  ip_version: 'v4',
  pool_type: 'unicast',
}

export const ipPool4: Json<IpPool> = {
  id: 'a5f395a8-650e-44c9-9af8-ec21d890f61c',
  name: 'ip-pool-4',
  description: '',
  time_created: new Date().toISOString(),
  time_modified: new Date().toISOString(),
  ip_version: 'v6',
  pool_type: 'unicast',
}

// Multicast pools for testing that they are NOT selected for ephemeral/floating IPs
export const ipPool5Multicast: Json<IpPool> = {
  id: 'b6c4a6b9-761e-4d28-94c0-fd3d7738ef1d',
  name: 'ip-pool-5-multicast-v4',
  description: 'Multicast v4 pool',
  time_created: new Date().toISOString(),
  time_modified: new Date().toISOString(),
  ip_version: 'v4',
  pool_type: 'multicast',
}

export const ipPool6Multicast: Json<IpPool> = {
  id: 'c7d5b7ca-872f-4e39-95d1-fe4e8849f02e',
  name: 'ip-pool-6-multicast-v6',
  description: 'Multicast v6 pool',
  time_created: new Date().toISOString(),
  time_modified: new Date().toISOString(),
  ip_version: 'v6',
  pool_type: 'multicast',
}

export const ipPools: Json<IpPool>[] = [
  ipPool1,
  ipPool2,
  ipPool3,
  ipPool4,
  ipPool5Multicast,
  ipPool6Multicast,
]

export const ipPoolSilos: Json<IpPoolSiloLink>[] = [
  // maze-war (default silo): both v4 and v6 defaults
  {
    ip_pool_id: ipPool1.id,
    silo_id: defaultSilo.id,
    is_default: true,
  },
  {
    ip_pool_id: ipPool2.id,
    silo_id: defaultSilo.id,
    is_default: true, // Both v4 and v6 unicast pools are default - valid dual-default scenario
  },
  // Make multicast pools also default to test that they are NOT selected
  {
    ip_pool_id: ipPool5Multicast.id,
    silo_id: defaultSilo.id,
    is_default: true,
  },
  {
    ip_pool_id: ipPool6Multicast.id,
    silo_id: defaultSilo.id,
    is_default: true,
  },

  // myriad silo: v4-only default
  {
    ip_pool_id: ipPool1.id,
    silo_id: myriadSilo.id,
    is_default: true, // Single v4 default
  },
  {
    ip_pool_id: ipPool3.id,
    silo_id: myriadSilo.id,
    is_default: false, // Extra v4 pool for selection tests
  },

  // thrax silo: v6-only default
  {
    ip_pool_id: ipPool2.id,
    silo_id: thraxSilo.id,
    is_default: true, // Single v6 default
  },
  {
    ip_pool_id: ipPool4.id,
    silo_id: thraxSilo.id,
    is_default: false, // Extra v6 pool for selection tests
  },

  // pelerines silo: no defaults (for testing error/empty states)
  {
    ip_pool_id: ipPool1.id,
    silo_id: pelerinesSilo.id,
    is_default: false,
  },
  {
    ip_pool_id: ipPool2.id,
    silo_id: pelerinesSilo.id,
    is_default: false,
  },
]

export const ipPoolRanges: Json<IpPoolRange[]> = [
  {
    id: 'bbfcf3f2-061e-4334-a0e7-dfcd8171f87e',
    ip_pool_id: ipPool1.id,
    range: {
      first: '123.4.56.0',
      last: '123.4.56.20',
    },
    time_created: new Date().toISOString(),
  },
  {
    id: 'df05795b-cb88-4971-9865-ac2995c2b2d4',
    ip_pool_id: ipPool1.id,
    range: {
      first: '10.0.0.20',
      last: '10.0.0.22',
    },
    time_created: new Date().toISOString(),
  },

  {
    id: '7e6e94b9-748e-4219-83a3-cec76253ec70',
    ip_pool_id: ipPool2.id,
    range: {
      first: 'fd00::1',
      last: 'fd00::20',
    },
    time_created: new Date().toISOString(),
  },
  // pool 3 has no ranges
  {
    id: '914b10e1-0452-4d87-bc9b-7b91cc7c7628',
    ip_pool_id: ipPool4.id,
    range: {
      first: '::1',
      last: '::ffff:ffff:ffff:ffff',
    },
    time_created: new Date().toISOString(),
  },
  // Multicast pool ranges (should NOT be used for ephemeral/floating IPs)
  {
    id: 'e8f6c8db-9830-4f4a-a6e2-0f5f99600b3f',
    ip_pool_id: ipPool5Multicast.id,
    range: {
      first: '224.0.0.1',
      last: '224.0.0.32',
    },
    time_created: new Date().toISOString(),
  },
  {
    id: 'f9a7d9ec-a940-5a5b-b7f3-0a6aa0710b4a',
    ip_pool_id: ipPool6Multicast.id,
    range: {
      first: 'ff00::1',
      last: 'ff00::ffff:ffff:ffff:ffff',
    },
    time_created: new Date().toISOString(),
  },
]
