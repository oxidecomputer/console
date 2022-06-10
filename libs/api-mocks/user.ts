import type { User } from '@oxide/api'

import type { Json } from './json-type'

export const user1: Json<User> = {
  name: 'Abraham Lincoln',
  description: 'A decent president',
  id: 'user-1',
  time_created: new Date(2021, 1, 1).toISOString(),
  time_modified: new Date(2021, 1, 2).toISOString(),
}

export const user2: Json<User> = {
  name: 'Franklin Delano Roosevelt',
  description: 'A pretty good president',
  id: 'user-2',
  time_created: new Date(2021, 1, 3).toISOString(),
  time_modified: new Date(2021, 1, 4).toISOString(),
}

export const users = [user1, user2]
