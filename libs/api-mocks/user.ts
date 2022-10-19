import type { User } from '@oxide/api'

import type { Json } from './json-type'
import { defaultSilo } from './silo'

export const user1: Json<User> = {
  id: '2e28576d-43e0-4e9e-9132-838a7b66f602',
  display_name: 'Hannah Arendt',
  silo_id: defaultSilo.id,
}

export const user2: Json<User> = {
  id: '6937b251-013c-4f96-9afc-c62b1318dd0b',
  display_name: 'Hans Jonas',
  silo_id: defaultSilo.id,
}

export const user3: Json<User> = {
  id: '4962021b-35e1-44a7-a40c-2264cd540615',
  display_name: 'Jacob Klein',
  silo_id: defaultSilo.id,
}

export const user4: Json<User> = {
  id: '37c6aa2f-899e-4d56-bad1-93b5526a7151',
  display_name: 'Simone de Beauvoir',
  silo_id: defaultSilo.id,
}

export const users = [user1, user2, user3, user4]
