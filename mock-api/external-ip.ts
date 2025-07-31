/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import type { ExternalIp } from '@oxide/api'

import { failedInstance, instance, instanceDb2, startingInstance } from './instance'
import { ipPool1 } from './ip-pool'
import type { Json } from './json-type'

/**
 * This is a case where we need extra structure beyond the API response. The API
 * response for an ephemeral IP does not indicate the instance it's attached to
 * (maybe it should, but that's a separate problem), but we need the instance ID
 * on each one in order to look up the IPs for a given instance. The floating IP
 * arm of the union does have an instance_id field, so that's a point in favor
 * of adding it to the ephemeral IP arm.
 */
type DbExternalIp = {
  instance_id: string
  external_ip: Json<ExternalIp>
}

// Note that ExternalIp is a union of types representing ephemeral, floating, and
// SNAT IPs, but we only put the ephemeral and SNAT ones here. We have a separate
// table for floating IPs, analogous to the floating_ip view in Nexus.

// Note that these addresses should come from ranges in ip-pool-1
export const ephemeralIps: DbExternalIp[] = [
  {
    instance_id: instance.id,
    external_ip: {
      ip: '123.4.56.0',
      ip_pool_id: ipPool1.id,
      kind: 'ephemeral',
    },
  },
  // failedInstance has no ephemeral IPs
  {
    instance_id: startingInstance.id,
    external_ip: {
      ip: '123.4.56.1',
      ip_pool_id: ipPool1.id,
      kind: 'ephemeral',
    },
  },
  {
    instance_id: startingInstance.id,
    external_ip: {
      ip: '123.4.56.2',
      ip_pool_id: ipPool1.id,
      kind: 'ephemeral',
    },
  },
  {
    instance_id: startingInstance.id,
    external_ip: {
      ip: '123.4.56.3',
      ip_pool_id: ipPool1.id,
      kind: 'ephemeral',
    },
  },
]

// Note that SNAT IPs are subdivided into four ranges of ports,
// with each instance getting a unique range.
export const snatIps: DbExternalIp[] = [
  {
    instance_id: instance.id,
    external_ip: {
      ip: '123.4.56.10',
      ip_pool_id: ipPool1.id,
      kind: 'snat',
      first_port: 0,
      last_port: 16383,
    },
  },
  {
    instance_id: startingInstance.id,
    external_ip: {
      ip: '123.4.56.10',
      ip_pool_id: ipPool1.id,
      kind: 'snat',
      first_port: 16384,
      last_port: 32767,
    },
  },
  {
    instance_id: instanceDb2.id,
    external_ip: {
      ip: '123.4.56.10',
      ip_pool_id: ipPool1.id,
      kind: 'snat',
      first_port: 32768,
      last_port: 49151,
    },
  },
  {
    instance_id: failedInstance.id,
    external_ip: {
      ip: '123.4.56.10',
      ip_pool_id: ipPool1.id,
      kind: 'snat',
      first_port: 49151,
      last_port: 65535,
    },
  },
]
