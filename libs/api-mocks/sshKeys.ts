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
    public_key: 'aslsddlfkjsdlfkjsdlfkjsdflkjsdlfkjsdlfkjsdlfkjsd',
    silo_user_id: user1.id,
  },
]
