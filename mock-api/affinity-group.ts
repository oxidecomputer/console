/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import type {
  AffinityGroup,
  AffinityGroupMember,
  AntiAffinityGroup,
  AntiAffinityGroupMember,
} from '@oxide/api'

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

export const affinityGroupMemberInstance: Json<AffinityGroupMember> = {
  type: 'instance',
  value: { id: instance.id, name: instance.name, run_state: instance.run_state },
}

export const affinityGroupDb2Instance: Json<AffinityGroupMember> = {
  type: 'instance',
  value: { id: instanceDb2.id, name: instanceDb2.name, run_state: instanceDb2.run_state },
}

export const affinityGroupMemberStartingInstance: Json<AffinityGroupMember> = {
  type: 'instance',
  value: {
    id: startingInstance.id,
    name: startingInstance.name,
    run_state: startingInstance.run_state,
  },
}

export const nonMatchingAffinityGroupMemberInstance: Json<AffinityGroupMember> = {
  type: 'instance',
  value: {
    id: '4f1f4dc9-da8a-48d6-ace2-c3f6330d4a5e',
    name: 'a non-matching instance that shouldn’t be in the list',
    run_state: 'stopped',
  },
}

export const affinityGroupMembers: Json<AffinityGroupMember>[] = [
  affinityGroupMemberInstance,
  affinityGroupMemberStartingInstance,
  nonMatchingAffinityGroupMemberInstance,
]

type DbAffinityGroupMember = {
  affinity_group_id: string
  affinity_group_member: Json<AffinityGroupMember>
}

export const affinityGroupMemberLists: DbAffinityGroupMember[] = [
  {
    affinity_group_id: affinityGroup.id,
    affinity_group_member: affinityGroupMemberInstance,
  },
  {
    affinity_group_id: affinityGroup.id,
    affinity_group_member: affinityGroupMemberStartingInstance,
  },
  {
    affinity_group_id: sandboxAffinityGroup.id,
    affinity_group_member: affinityGroupMemberInstance,
  },
]

// Anti-affinity groups

export const romulusRemus: Json<AntiAffinityGroup> = {
  id: 'c874bfbe-c896-48b1-b6f1-9a3dfb7fb7c9',
  name: 'romulus-remus',
  description: '',
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
  anti_affinity_group_member: Json<AntiAffinityGroupMember>
}

// set variable names for each anti-affinity group member
export const antiAffinityGroupMemberLists: DbAntiAffinityGroupMember[] = [
  {
    anti_affinity_group_id: romulusRemus.id,
    anti_affinity_group_member: affinityGroupMemberInstance,
  },
  {
    anti_affinity_group_id: romulusRemus.id,
    anti_affinity_group_member: affinityGroupDb2Instance,
  },
  {
    anti_affinity_group_id: setOsiris.id,
    anti_affinity_group_member: affinityGroupMemberStartingInstance,
  },
  {
    anti_affinity_group_id: oilWater.id,
    anti_affinity_group_member: affinityGroupMembers[0],
  },
]

export const antiAffinityGroupMembers: Json<AntiAffinityGroupMember>[] = [
  {
    type: 'instance',
    value: { id: instance.id, name: instance.name, run_state: instance.run_state },
  },
  {
    type: 'instance',
    value: {
      id: startingInstance.id,
      name: startingInstance.name,
      run_state: startingInstance.run_state,
    },
  },
  {
    type: 'instance',
    value: {
      id: '4f1f4dc9-da8a-48d6-ace2-c3f6330d4a5e',
      name: 'a non-matching instance that shouldn’t be in the list',
      run_state: 'stopped',
    },
  },
]
