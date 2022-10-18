import type { User } from '@oxide/api'

import type { Json } from './json-type'
import { defaultSilo } from './silo'

export const currentUser: Json<User> = {
  id: '001de000-05e4-4000-8000-000000060001',
  silo_id: defaultSilo.id,
  display_name: 'Grace Hopper',
}
