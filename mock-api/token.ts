/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import type { DeviceAccessToken } from '@oxide/api'

import type { Json } from './json-type'

export const deviceTokens: Json<DeviceAccessToken>[] = [
  {
    id: '6e762538-dd89-454e-b6e7-82a199b6e51a',
    time_created: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
    time_expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
  },
  {
    id: '9c858b30-bb11-4596-8c5e-c2bf1a26843e',
    time_created: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days ago
    time_expires: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days from now
  },
  {
    id: '29b1d980-e0d3-4318-b714-4a1f3e7b191f',
    time_created: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    time_expires: null, // Never expires
  },
]
