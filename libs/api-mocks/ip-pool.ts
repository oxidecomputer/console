/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { type IpPool, type IpPoolSilo } from '@oxide/api'

import type { Json } from './json-type'
import { defaultSilo } from './silo'

const ipPool1: Json<IpPool> = {
  id: '69b5c583-74a9-451a-823d-0741c1ec66e2',
  name: 'ip-pool-1',
  description: '',
  time_created: new Date().toISOString(),
  time_modified: new Date().toISOString(),
}

const ipPool2: Json<IpPool> = {
  id: 'af2fbe06-b21d-4364-96b7-a58220bc3242',
  name: 'ip-pool-2',
  description: '',
  time_created: new Date().toISOString(),
  time_modified: new Date().toISOString(),
}

export const ipPools: Json<IpPool>[] = [ipPool1, ipPool2]

export const ipPoolSilos: Json<IpPoolSilo>[] = [
  {
    ip_pool_id: ipPool1.id,
    silo_id: defaultSilo.id,
    is_default: true,
  },
]
