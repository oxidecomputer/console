/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import type { AffinityGroupMember } from '@oxide/api'

import { instance } from './instance'
import type { Json } from './json-type'

export const affinityGroupMembers: Json<AffinityGroupMember>[] = [
  {
    type: 'instance',
    value: { id: instance.id, name: instance.name, run_state: instance.run_state },
  },
  {
    type: 'instance',
    value: {
      id: '250037eb-809e-4dcb-a2be-f2c110223afb',
      name: 'a non-matching instance that shouldn’t be in the list',
      run_state: 'running',
    },
  },
]
