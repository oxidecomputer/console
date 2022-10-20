import type { Group } from '@oxide/api'

import type { Json } from './json-type'
import { defaultSilo } from './silo'
import { user1 } from './user'

export const userGroup1: Json<Group> = {
  id: '0ff6da96-5d6d-4326-b059-2b72c1b51457',
  silo_id: defaultSilo.id,
  display_name: 'web-devs',
}

export const userGroup2: Json<Group> = {
  id: '1b5fa004-a378-4225-960f-60f089684b05',
  silo_id: defaultSilo.id,
  display_name: 'kernel-devs',
}

export const userGroup3: Json<Group> = {
  id: '5e30797c-cae3-4402-aeb7-d5044c4bed29',
  silo_id: defaultSilo.id,
  display_name: 'real-estate-devs',
}

export const userGroups = [userGroup1, userGroup2, userGroup3]

type GroupMembership = {
  userId: string
  groupId: string
}

export const groupMemberships: GroupMembership[] = [
  {
    userId: user1.id,
    groupId: userGroup1.id,
  },
]
