/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import type { ExternalIp } from '@oxide/api'

import { instances } from './instance'
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

// Note that ExternalIp is a union of types representing ephemeral and floating
// IPs, but we only put the ephemeral ones here. We have a separate table for
// floating IPs analogous to the floating_ip view in Nexus.

// Note that these addresses should come from ranges in ip-pool-1

export const ephemeralIps: DbExternalIp[] = [
  {
    instance_id: instances[0].id,
    external_ip: {
      ip: '123.4.56.0',
      kind: 'ephemeral',
    },
  },
  // middle one has no IPs
  // third has one ephemeral
  {
    instance_id: instances[2].id,
    external_ip: {
      ip: '123.4.56.1',
      kind: 'ephemeral',
    },
  },
]
