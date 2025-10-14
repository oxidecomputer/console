/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import type { TufRepo, UpdateStatus } from '@oxide/api'

import type { Json } from './json-type'

export const tufRepos: Json<TufRepo>[] = [
  {
    system_version: '18.0.0',
    file_name: 'rack-18.0.0.zip',
    hash: 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6',
    time_created: new Date('2024-03-15T14:30:00Z').toISOString(),
  },
  {
    system_version: '17.0.0',
    file_name: 'rack-17.0.0.zip',
    hash: '7d793037a0760186574b0282f2f435e7',
    time_created: new Date('2024-02-20T14:30:00Z').toISOString(),
  },
  {
    system_version: '16.0.0',
    file_name: 'rack-16.0.0.zip',
    hash: '5d41402abc4b2a76b9719d911017c592',
    time_created: new Date('2024-01-15T10:00:00Z').toISOString(),
  },
]

export const updateStatus: Json<UpdateStatus> = {
  components_by_release_version: {
    '18.0.0': 3,
    '17.0.0': 12,
    '16.0.0': 5,
  },
  suspended: false,
  target_release: {
    version: '17.0.0',
    time_requested: new Date('2024-02-25T10:00:00Z').toISOString(),
  },
  time_last_step_planned: new Date().toISOString(),
}
