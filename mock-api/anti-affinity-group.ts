/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import type { AntiAffinityGroup } from '@oxide/api'

import type { Json } from './json-type'
import { project } from './project'

export const antiAffinityGroups: Json<AntiAffinityGroup>[] = [
  {
    id: 'c874bfbe-c896-48b1-b6f1-9a3dfb7fb7c9',
    name: 'romulus-remus',
    description: '',
    failure_domain: 'sled',
    policy: 'fail',
    project_id: project.id,
    time_created: '2025-03-10T01:23:45.678Z',
    time_modified: '2025-03-10T01:23:45.678Z',
  },
  {
    id: 'c874bfbe-c896-48b1-b6f1-9a3dfb7fb7c9',
    name: 'set-osiris',
    description: '',
    failure_domain: 'sled',
    policy: 'allow',
    project_id: project.id,
    time_created: '2025-03-12T02:34:56.789Z',
    time_modified: '2025-03-12T02:34:56.789Z',
  },
  {
    id: 'bd2d3edf-fd4e-4eca-922c-8b447a2e7151',
    name: 'oil-water',
    description: '',
    failure_domain: 'sled',
    policy: 'fail',
    project_id: project.id,
    time_created: '2025-02-15T00:00:00.000Z',
    time_modified: '2025-03-15T01:05:15.151Z',
  },
]
