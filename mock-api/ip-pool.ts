/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { type IpPool, type IpPoolRange, type IpPoolSiloLink } from '@oxide/api'

import type { Json } from './json-type'
import { defaultSilo } from './silo'

export const defaultIpPool: Json<IpPool> = {
  id: 'cadb8535-e32f-4be2-9259-e45dec9fa3cd',
  name: 'default',
  description: 'default IP pool',
  time_created: new Date().toISOString(),
  time_modified: new Date().toISOString(),
}

export const ipPool1: Json<IpPool> = {
  id: '69b5c583-74a9-451a-823d-0741c1ec66e2',
  name: 'ip-pool-1',
  description: 'public IPs',
  time_created: new Date().toISOString(),
  time_modified: new Date().toISOString(),
}

const ipPool2: Json<IpPool> = {
  id: 'af2fbe06-b21d-4364-96b7-a58220bc3242',
  name: 'ip-pool-2',
  description: 'VPN IPs',
  time_created: new Date().toISOString(),
  time_modified: new Date().toISOString(),
}

const ipPool3: Json<IpPool> = {
  id: '8929a9ec-03d7-4027-8bf3-dda76627de07',
  name: 'ip-pool-3',
  description: '',
  time_created: new Date().toISOString(),
  time_modified: new Date().toISOString(),
}

const ipPool4: Json<IpPool> = {
  id: 'a5f395a8-650e-44c9-9af8-ec21d890f61c',
  name: 'ip-pool-4',
  description: '',
  time_created: new Date().toISOString(),
  time_modified: new Date().toISOString(),
}

export const ipPools: Json<IpPool>[] = [defaultIpPool, ipPool1, ipPool2, ipPool3, ipPool4]

export const ipPoolSilos: Json<IpPoolSiloLink>[] = [
  {
    ip_pool_id: defaultIpPool.id,
    silo_id: defaultSilo.id,
    is_default: true,
  },
  {
    ip_pool_id: ipPool1.id,
    silo_id: defaultSilo.id,
    is_default: false,
  },
  {
    ip_pool_id: ipPool2.id,
    silo_id: defaultSilo.id,
    is_default: false,
  },
]

export const ipPoolRanges: Json<IpPoolRange[]> = [
  {
    id: 'f6b3b9b5-7e3d-4b8c-9f6b-9b7b5e3d8c4b',
    ip_pool_id: defaultIpPool.id,
    range: {
      first: '170.20.26.11',
      last: '170.20.26.254',
    },
    time_created: new Date().toISOString(),
  },
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
    id: '4d85c502-52cc-47f9-b525-14b64cf5f1ea',
    ip_pool_id: ipPool4.id,
    range: {
      first: '10.0.0.50',
      last: '10.0.1.0',
    },
    time_created: new Date().toISOString(),
  },
  {
    id: '914b10e1-0452-4d87-bc9b-7b91cc7c7628',
    ip_pool_id: ipPool4.id,
    range: {
      first: '::1',
      last: '::ffff:ffff:ffff:ffff',
    },
    time_created: new Date().toISOString(),
  },
]
