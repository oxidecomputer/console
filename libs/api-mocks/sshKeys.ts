import type { SshKey } from '@oxide/api'
import type { Json } from './json-type'

export const sshKeys: Json<SshKey>[] = [
  {
    id: 'ssh-key-id-1',
    name: 'M1 Mackbook Pro',
    description: 'For use on personal projects',
    time_created: new Date().toISOString(),
    time_modified: new Date().toISOString(),
    public_key: 'aslsddlfkjsdlfkjsdlfkjsdflkjsdlfkjsdlfkjsdlfkjsd',
    silo_user_id: 'user-id-1',
  },
]
