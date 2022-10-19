import type { SshKey } from '@oxide/api'

import type { Json } from './json-type'
import { silos } from './silo'

export const sshKeys: Json<SshKey>[] = [
  {
    id: '43af8bc5-6f8e-404d-8b39-72b07cc9da56',
    name: 'M1 Mackbook Pro',
    description: 'For use on personal projects',
    time_created: new Date().toISOString(),
    time_modified: new Date().toISOString(),
    public_key: 'aslsddlfkjsdlfkjsdlfkjsdflkjsdlfkjsdlfkjsdlfkjsd',
    silo_user_id: silos[0].id,
  },
]
