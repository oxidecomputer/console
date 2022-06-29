import type { User } from '@oxide/api'

import type { Json } from './json-type'

export const user1: Json<User> = {
  id: 'user-1',
  display_name: 'Hannah Arendt',
}

export const user2: Json<User> = {
  id: 'user-2',
  display_name: 'Hans Jonas',
}

export const users = [user1, user2]
