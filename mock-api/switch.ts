/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import type { Switch } from '@oxide/api'

import type { Json } from './json-type'
import { rack } from './rack'

export const switches: Json<Switch[]> = [
  {
    baseboard: {
      part: '832-0431906',
      serial: 'BDS02141689',
      revision: 1,
    },
    id: 'ed66617e-4955-465e-b810-0d0dc55d4511',
    rack_id: rack.id,
    time_created: rack.time_created,
    time_modified: rack.time_modified,
  },
]
