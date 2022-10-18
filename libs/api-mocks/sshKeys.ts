import type { SshKey } from '@oxide/api'

import type { Json } from './json-type'
import { genId } from './msw/util'
import { silos } from './silo'

export const sshKeys: Json<SshKey>[] = [
  {
    id: genId('M1 Mackbook Pro'),
    name: 'M1 Mackbook Pro',
    description: 'For use on personal projects',
    time_created: new Date().toISOString(),
    time_modified: new Date().toISOString(),
    public_key: 'aslsddlfkjsdlfkjsdlfkjsdflkjsdlfkjsdlfkjsdlfkjsd',
    silo_user_id: silos[0].id,
  },
]
