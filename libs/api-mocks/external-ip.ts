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

type DbExternalIp = {
  instance_id: string
  external_ip: Json<ExternalIp>
}

// TODO: this type represents the API response, but we need to mock more
// structure in order to be able to look up IPs for a particular instance
export const externalIps: DbExternalIp[] = [
  {
    instance_id: instances[0].id,
    external_ip: {
      ip: `123.4.56.0`,
      kind: 'ephemeral',
    },
  },
  // middle one has no IPs
  {
    instance_id: instances[2].id,
    external_ip: {
      ip: `123.4.56.1`,
      kind: 'ephemeral',
    },
  },
  {
    instance_id: instances[2].id,
    external_ip: {
      ip: `123.4.56.2`,
      kind: 'ephemeral',
    },
  },
  {
    instance_id: instances[2].id,
    external_ip: {
      ip: `123.4.56.3`,
      kind: 'ephemeral',
    },
  },
]
