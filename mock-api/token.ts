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
    id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    time_created: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
    time_expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
  },
  {
    id: 'b2c3d4e5-f6g7-8901-bcde-f23456789012',
    time_created: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days ago
    time_expires: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days from now
  },
  {
    id: 'c3d4e5f6-g7h8-9012-cdef-345678901234',
    time_created: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    time_expires: null, // Never expires
  },
]
