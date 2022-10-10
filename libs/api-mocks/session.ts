import type { User } from '@oxide/api'

import { defaultSilo } from './silo'

export const sessionMe: User = {
  id: '001de000-05e4-4000-8000-000000060001',
  siloId: defaultSilo.id,
  displayName: 'Grace Hopper',
}
