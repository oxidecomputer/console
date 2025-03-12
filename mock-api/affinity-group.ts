/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import type { AffinityGroup } from '@oxide/api'

import type { Json } from './json-type'
import { project } from './project'

export const affinityGroup: Json<AffinityGroup> = {
  id: '3ee49935-b1db-45dd-bfda-67905e6bcab9',
  name: 'main-web-prod',
  description: 'Main web deployments',
  failure_domain: 'sled',
  policy: 'allow',
  project_id: project.id,
  time_created: '2025-03-01T00:00:00.000Z',
  time_modified: '2025-04-05T12:10:07.917Z',
}

export const sandboxAffinityGroup: Json<AffinityGroup> = {
  id: 'c5866165-0fd9-477a-b5ee-0094eaa93dab',
  name: 'sandbox-env',
  description: '',
  failure_domain: 'sled',
  policy: 'fail',
  project_id: project.id,
  time_created: '2025-03-03T00:00:00.000Z',
  time_modified: '2025-03-09T00:00:00.000Z',
}

export const affinityGroups: Json<AffinityGroup>[] = [
  affinityGroup,
  sandboxAffinityGroup,
  {
    id: '3989818a-6d82-4715-b486-189c981f2c0a',
    name: 'test',
    description: '',
    failure_domain: 'sled',
    policy: 'fail',
    project_id: project.id,
    time_created: '2025-04-13T00:00:00.000Z',
    time_modified: '2025-04-16T00:00:00.000Z',
  },
]
