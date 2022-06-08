import type { User } from '@oxide/api'

import type { Json } from './json-type'

export const user: Json<User> = {
  name: 'Abraham Lincoln',
  description: 'A decent president',
  id: 'user-1',
  time_created: new Date(2021, 1, 1).toISOString(),
  time_modified: new Date(2021, 1, 2).toISOString(),
}

export const users = [user]
