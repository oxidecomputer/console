/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import type { PhysicalDisk } from '@oxide/api'

import type { Json } from './json-type'

export const physicalDisks: Json<PhysicalDisk>[] = [
  {
    id: 'd2cf9763-cfce-4291-8531-614c8b4aa632',
    form_factor: 'u2',
    model: 'MTFDKBG800TDZ-1AZ1ZAB',
    serial: '0C98MRMBK64',
    vendor: '0634',
    time_created: new Date().toISOString(),
    time_modified: new Date().toISOString(),
    sled_id: 'c2519937-44a4-493b-9b38-5c337c597d08',
  },
  {
    id: '9d43adfe-c46a-4a33-b060-146cbd48b767',
    form_factor: 'u2',
    model: 'MTFDKBG800TDZ-1AZ1ZAB',
    serial: 'A9GCW7OS3HT',
    vendor: '0634',
    time_created: new Date().toISOString(),
    time_modified: new Date().toISOString(),
    sled_id: 'c2519937-44a4-493b-9b38-5c337c597d08',
  },
  {
    id: 'f253c29f-321b-46d0-a132-6235cc63e3d2',
    form_factor: 'u2',
    model: 'MTFDKBG800TDZ-1AZ1ZAB',
    serial: '0V2L160OZ9J',
    vendor: '0634',
    time_created: new Date().toISOString(),
    time_modified: new Date().toISOString(),
    sled_id: 'c2519937-44a4-493b-9b38-5c337c597d08',
  },
  {
    id: '0591ae13-3c72-4701-a801-20e44f809496',
    form_factor: 'm2',
    model: 'MTFDKBG800TDZ-1AZ1ZAB',
    serial: 'CA73ANUYLJ9',
    vendor: '0634',
    time_created: new Date().toISOString(),
    time_modified: new Date().toISOString(),
    sled_id: 'c2519937-44a4-493b-9b38-5c337c597d08',
  },
]
