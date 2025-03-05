/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import type { AntiAffinityGroupMember } from '@oxide/api'

import { affinityGroups } from './affinity-group'
import { instance } from './instance'
import type { Json } from './json-type'

export const antiAffinityGroupMembers: Json<AntiAffinityGroupMember>[] = [
  {
    type: 'affinity_group',
    value: { id: affinityGroups[0].id, name: 'anti-group-ag' },
  },
  {
    type: 'instance',
    value: { id: instance.id, name: 'anti-group-instance', run_state: instance.run_state },
  },
  {
    type: 'instance',
    value: {
      id: '4f1f4dc9-da8a-48d6-ace2-c3f6330d4a5e',
      name: 'a non-matching instance that shouldn’t be in the list',
      run_state: 'stopped',
    },
  },
]
