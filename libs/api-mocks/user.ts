import type { User } from '@oxide/api'

import type { Json } from './json-type'
import { genId } from './msw/util'
import { defaultSilo } from './silo'

export const user1: Json<User> = {
  id: genId('Hannah Arendt'),
  display_name: 'Hannah Arendt',
  silo_id: defaultSilo.id,
}

export const user2: Json<User> = {
  id: genId('Hans Jonas'),
  display_name: 'Hans Jonas',
  silo_id: defaultSilo.id,
}

export const user3: Json<User> = {
  id: genId('Jacob Klein'),
  display_name: 'Jacob Klein',
  silo_id: defaultSilo.id,
}

export const user4: Json<User> = {
  id: genId('Simone de Beauvoir'),
  display_name: 'Simone de Beauvoir',
  silo_id: defaultSilo.id,
}

export const users = [user1, user2, user3, user4]
