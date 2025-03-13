/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import type { AffinityGroupMember, AntiAffinityGroupMember } from '@oxide/api'

import { affinityGroups } from './affinity-group'
import { affinityGroupMembers } from './affinity-group-member'
import { antiAffinityGroups } from './anti-affinity-group'
import { antiAffinityGroupMembers } from './anti-affinity-group-member'
import type { Json } from './json-type'

type DbAffinityGroupMember = {
  affinity_group_id: string
  affinity_group_member: Json<AffinityGroupMember>
}

export const affinityGroupMemberLists: DbAffinityGroupMember[] = [
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

type DbAntiAffinityGroupMember = {
  anti_affinity_group_id: string
  anti_affinity_group_member: Json<AntiAffinityGroupMember>
}

export const antiAffinityGroupMemberLists: DbAntiAffinityGroupMember[] = [
  {
    anti_affinity_group_id: antiAffinityGroups[0].id,
    anti_affinity_group_member: antiAffinityGroupMembers[0],
  },
  {
    anti_affinity_group_id: antiAffinityGroups[1].id,
    anti_affinity_group_member: antiAffinityGroupMembers[0],
  },
  {
    anti_affinity_group_id: antiAffinityGroups[2].id,
    anti_affinity_group_member: antiAffinityGroupMembers[0],
  },
]
