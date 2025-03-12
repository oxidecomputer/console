/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import type { AffinityGroupMember } from '@oxide/api'

import { affinityGroups } from './affinity-group'
import { affinityGroupMembers } from './affinity-group-member'
import type { Json } from './json-type'

type DbAffinityGroupMember = {
  affinity_group_id: string
  affinity_group_member: AffinityGroupMember
}

export const affinityGroupMemberLists: Json<DbAffinityGroupMember>[] = [
  {
    affinity_group_id: affinityGroups[0].id,
    affinity_group_member: affinityGroupMembers[0],
  },
  {
    affinity_group_id: affinityGroups[1].id,
    affinity_group_member: affinityGroupMembers[0],
  },
  {
    affinity_group_id: affinityGroups[0].id,
    affinity_group_member: affinityGroupMembers[1],
  },
]
