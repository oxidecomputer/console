/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import type { PhysicalDisk } from '@oxide/api'

import type { Json } from './json-type'

const base = {
  model: 'MTFDKBG800TDZ-1AZ1ZAB',
  vendor: '0634',
  sled_id: 'c2519937-44a4-493b-9b38-5c337c597d08',
  policy: { kind: 'in_service' as const },
  state: 'active' as const,
  time_created: new Date().toISOString(),
  time_modified: new Date().toISOString(),
}

export const physicalDisks: Json<PhysicalDisk>[] = [
  {
    ...base,
    id: 'd2cf9763-cfce-4291-8531-614c8b4aa632',
    form_factor: 'u2',
    serial: '0C98MRMBK64',
  },
  {
    ...base,
    id: '9d43adfe-c46a-4a33-b060-146cbd48b767',
    form_factor: 'u2',
    serial: 'A9GCW7OS3HT',
  },
  {
    ...base,
    id: 'f253c29f-321b-46d0-a132-6235cc63e3d2',
    form_factor: 'u2',
    serial: '0V2L160OZ9J',
  },
  {
    ...base,
    id: '0591ae13-3c72-4701-a801-20e44f809496',
    form_factor: 'm2',
    serial: 'CA73ANUYLJ9',
  },
  {
    ...base,
    id: 'ba1c3581-b35b-48a5-924a-cb19921dca54',
    form_factor: 'm2',
    serial: 'F02106C3R2A',
    state: 'decommissioned' as const,
    policy: { kind: 'expunged' as const },
  },
]
