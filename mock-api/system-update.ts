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
    hash: '163acd11ef5b14aac27d04b2080393826e832714',
    time_created: new Date('2024-03-15T14:30:00Z').toISOString(),
  },
  {
    system_version: '17.0.0',
    file_name: 'rack-17.0.0.zip',
    hash: '6510e87da6a6078509836e8faa27dc20272b472e',
    time_created: new Date('2024-02-20T14:30:00Z').toISOString(),
  },
  {
    system_version: '16.0.0',
    file_name: 'rack-16.0.0.zip',
    hash: '58f95ded7eed49fd30659035c5c16b5bb9e63a76',
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
