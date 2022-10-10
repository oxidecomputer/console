import type { User } from '@oxide/api'

import type { Json } from './json-type'
import { defaultSilo } from './silo'

export const user1: Json<User> = {
  id: 'user-1',
  display_name: 'Hannah Arendt',
  silo_id: defaultSilo.id,
}

export const user2: Json<User> = {
  id: 'user-2',
  display_name: 'Hans Jonas',
  silo_id: defaultSilo.id,
}

export const user3: Json<User> = {
  id: 'user-3',
  display_name: 'Jacob Klein',
  silo_id: defaultSilo.id,
}

export const user4: Json<User> = {
  id: 'user-4',
  display_name: 'Simone de Beauvoir',
  silo_id: defaultSilo.id,
}

export const users = [user1, user2, user3, user4]
