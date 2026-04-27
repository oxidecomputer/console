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
    time_created: '2025-05-27T15:11:00Z',
    time_expires: '2025-07-03T15:11:00Z',
  },
  {
    id: '9c858b30-bb11-4596-8c5e-c2bf1a26843e',
    time_created: '2025-05-20T15:11:00Z',
    time_expires: '2025-08-02T15:11:00Z',
  },
  {
    id: '29b1d980-e0d3-4318-b714-4a1f3e7b191f',
    time_created: '2025-05-31T15:11:00Z',
    time_expires: null,
  },
]
