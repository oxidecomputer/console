import type { Group } from '@oxide/api'

import type { Json } from './json-type'
import { defaultSilo } from './silo'

export const userGroup1: Json<Group> = {
  id: 'user-group-1',
  silo_id: defaultSilo.id,
  display_name: 'web-devs',
}

export const userGroup2: Json<Group> = {
  id: 'user-group-2',
  silo_id: defaultSilo.id,
  display_name: 'kernel-devs',
}

export const userGroup3: Json<Group> = {
  id: 'user-group-3',
  silo_id: defaultSilo.id,
  display_name: 'real-estate-devs',
}

export const userGroups = [userGroup1, userGroup2, userGroup3]
