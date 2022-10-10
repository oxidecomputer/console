import type { Json } from './json-type'

// import type { Group } from '@oxide/api'

type UserGroup = { id: string; displayName: string }

export const userGroup1: Json<UserGroup> = {
  id: 'user-group-1',
  display_name: 'web-devs',
}

export const userGroup2: Json<UserGroup> = {
  id: 'user-group-2',
  display_name: 'kernal-devs',
}

export const userGroups = [userGroup1, userGroup2]
