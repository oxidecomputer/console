/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import type { AffinityGroup, AntiAffinityGroup } from '@oxide/api'

import { instance, instanceDb2, startingInstance } from './instance'
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

type DbAffinityGroupMember = {
  affinity_group_id: string
  affinity_group_member: { type: 'instance'; id: string }
}

export const affinityGroupMemberLists: DbAffinityGroupMember[] = [
  {
    affinity_group_id: affinityGroup.id,
    affinity_group_member: { type: 'instance', id: instance.id },
  },
  {
    affinity_group_id: affinityGroup.id,
    affinity_group_member: { type: 'instance', id: startingInstance.id },
  },
  {
    affinity_group_id: sandboxAffinityGroup.id,
    affinity_group_member: { type: 'instance', id: instance.id },
  },
]

// Anti-affinity groups

export const romulusRemus: Json<AntiAffinityGroup> = {
  id: 'c874bfbe-c896-48b1-b6f1-9a3dfb7fb7c9',
  name: 'romulus-remus',
  description:
    'Keep these two apart. and a bunch more words in the description. long long very long',
  failure_domain: 'sled',
  policy: 'fail',
  project_id: project.id,
  time_created: '2025-03-10T01:23:45.678Z',
  time_modified: '2025-03-10T01:23:45.678Z',
}

export const setOsiris: Json<AntiAffinityGroup> = {
  id: '14da2dfa-dbd9-4226-92cf-b4acf701eddc',
  name: 'set-osiris',
  description: '',
  failure_domain: 'sled',
  policy: 'allow',
  project_id: project.id,
  time_created: '2025-03-12T02:34:56.789Z',
  time_modified: '2025-03-12T02:34:56.789Z',
}

export const oilWater: Json<AntiAffinityGroup> = {
  id: 'bd2d3edf-fd4e-4eca-922c-8b447a2e7151',
  name: 'oil-water',
  description: '',
  failure_domain: 'sled',
  policy: 'fail',
  project_id: project.id,
  time_created: '2025-02-15T00:00:00.000Z',
  time_modified: '2025-03-15T01:05:15.151Z',
}

export const antiAffinityGroups = [romulusRemus, setOsiris, oilWater]

type DbAntiAffinityGroupMember = {
  anti_affinity_group_id: string
  anti_affinity_group_member: { type: 'instance'; id: string }
}

export const antiAffinityGroupMemberLists: DbAntiAffinityGroupMember[] = [
  {
    anti_affinity_group_id: romulusRemus.id,
    anti_affinity_group_member: { type: 'instance', id: instance.id },
  },
  {
    anti_affinity_group_id: romulusRemus.id,
    anti_affinity_group_member: { type: 'instance', id: instanceDb2.id },
  },
  {
    anti_affinity_group_id: setOsiris.id,
    anti_affinity_group_member: { type: 'instance', id: startingInstance.id },
  },
]
