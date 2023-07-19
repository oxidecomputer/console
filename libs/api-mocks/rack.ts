/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import type { Rack } from '@oxide/api'

import type { Json } from './json-type'

export const rack: Json<Rack> = {
  id: '6fbafcc7-1626-4785-be65-e212f8ad66d0',
  time_created: new Date(2021, 0, 1).toISOString(),
  time_modified: new Date(2021, 0, 2).toISOString(),
}

export const racks: Json<Rack[]> = [rack]
