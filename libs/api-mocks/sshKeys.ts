/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import type { SshKey } from '@oxide/api'

import type { Json } from './json-type'
import { user1 } from './user'

export const sshKeys: Json<SshKey>[] = [
  {
    id: '43af8bc5-6f8e-404d-8b39-72b07cc9da56',
    name: 'm1-macbook-pro',
    description: 'For use on personal projects',
    time_created: new Date().toISOString(),
    time_modified: new Date().toISOString(),
    public_key: 'aslsddlfkjsdlfkjsdlfkjsdlfkjsdflkjsdlfkjsdlfkjsd',
    silo_user_id: user1.id,
  },
  {
    id: 'b2c3d4e5-6f7g-8h9i-0j1k-2l3m4n5o6p7q',
    name: 'mac-mini',
    description: '',
    time_created: new Date().toISOString(),
    time_modified: new Date().toISOString(),
    public_key: 'aslsddlfkjsdlfkjsdlfkjsdlfkjsdflkjsdlfkjsdlfkjsd',
    silo_user_id: user1.id,
  },
  ...new Array(20).fill(0).map((_, i) => ({
    id: `id-${i}`,
    name: `mac-mini-${i}`,
    description: '',
    time_created: new Date().toISOString(),
    time_modified: new Date().toISOString(),
    public_key: 'aslsddlfkjsdlfkjsdlfkjsdlfkjsdflkjsdlfkjsdlfkjsd',
    silo_user_id: user1.id,
  })),
]
