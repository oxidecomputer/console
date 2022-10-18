import type { Group } from '@oxide/api'

import type { Json } from './json-type'
import { genId } from './msw/util'
import { defaultSilo } from './silo'

export const userGroup1: Json<Group> = {
  id: genId('web-devs'),
  silo_id: defaultSilo.id,
  display_name: 'web-devs',
}

export const userGroup2: Json<Group> = {
  id: genId('kernel-devs'),
  silo_id: defaultSilo.id,
  display_name: 'kernel-devs',
}

export const userGroup3: Json<Group> = {
  id: genId('real-estate-devs'),
  silo_id: defaultSilo.id,
  display_name: 'real-estate-devs',
}

export const userGroups = [userGroup1, userGroup2, userGroup3]
