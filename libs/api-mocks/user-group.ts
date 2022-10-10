import type { Json } from './json-type'

// import type { Group } from '@oxide/api'

type UserGroup = { id: string; displayName: string }

export const group1: Json<UserGroup> = {
  id: 'group-1',
  display_name: 'web-devs',
}

export const group2: Json<UserGroup> = {
  id: 'group-2',
  display_name: 'kernal-devs',
}
