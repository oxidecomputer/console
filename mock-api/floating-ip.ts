/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import type { FloatingIp } from '@oxide/api'

import { instance } from './instance'
import { ipPool1 } from './ip-pool'
import type { Json } from './json-type'
import { project } from './project'

// Note that these addresses should come from ranges in ip-pool-1

// A floating IP from the default pool
export const floatingIp: Json<FloatingIp> = {
  id: '3ca0ccb7-d66d-4fde-a871-ab9855eaea8e',
  name: 'rootbeer-float',
  description: 'A classic.',
  instance_id: undefined,
  ip: '123.4.56.4',
  ip_pool_id: ipPool1.id,
  project_id: project.id,
  time_created: new Date().toISOString(),
  time_modified: new Date().toISOString(),
}

// A floating IP attached to a particular instance
export const floatingIp2: Json<FloatingIp> = {
  id: '0a00a6c3-4821-4bb8-af77-574468ac6651',
  name: 'cola-float',
  description: 'A favourite.',
  instance_id: instance.id,
  ip: '123.4.56.5',
  ip_pool_id: ipPool1.id,
  project_id: project.id,
  time_created: new Date().toISOString(),
  time_modified: new Date().toISOString(),
}

export const floatingIps = [floatingIp, floatingIp2]
