import type { Group } from '@oxide/api'

import type { Json } from './json-type'
import { defaultSilo } from './silo'

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

export const userGroups = [userGroup1, userGroup2]
