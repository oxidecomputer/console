/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { v4 as uuid } from 'uuid'

import type { Snapshot } from '@oxide/api'

import { GiB } from '~/util/units'

import { disks } from './disk'
import type { Json } from './json-type'
import { project } from './project'

const generatedSnapshots: Json<Snapshot>[] = Array.from({ length: 160 }, (_, i) =>
  generateSnapshot(i)
)

export const snapshots: Json<Snapshot>[] = [
  {
    id: 'ab805e59-b6b8-4c73-8081-6a224b6b0698',
    name: 'snapshot-1',
    description: "it's a snapshot",
    project_id: project.id,
    time_created: new Date().toISOString(),
    time_modified: new Date().toISOString(),
    size: 1024,
    disk_id: disks[0].id,
    state: 'ready',
  },
  {
    id: '9a29813d-e94b-4c6a-82a0-672af3f78a6f',
    name: 'snapshot-2',
    description: "it's a second snapshot",
    project_id: project.id,
    time_created: new Date().toISOString(),
    time_modified: new Date().toISOString(),
    size: 2048,
    disk_id: disks[0].id,
    state: 'ready',
  },
  {
    id: 'e6c58826-62fb-4205-820e-620407cd04e7',
    name: 'delete-500',
    description: "it's a third snapshot",
    project_id: project.id,
    time_created: new Date().toISOString(),
    time_modified: new Date().toISOString(),
    size: 3072,
    disk_id: disks[0].id,
    state: 'ready',
  },
  {
    id: 'dc598369-4554-4ccd-aa89-a837e6ca487d',
    name: 'snapshot-4',
    description: "it's a fourth snapshot",
    project_id: project.id,
    time_created: new Date().toISOString(),
    time_modified: new Date().toISOString(),
    size: 4096,
    disk_id: disks[0].id,
    state: 'ready',
  },
  {
    id: 'ca117fc6-d3e4-452e-9e1c-15abea752ff6',
    name: 'snapshot-disk-deleted',
    description: 'technically it never existed',
    project_id: project.id,
    time_created: new Date().toISOString(),
    time_modified: new Date().toISOString(),
    size: 5120,
    disk_id: 'a6f61e3f-25c1-49b0-a013-ac6a2d98a948',
    state: 'ready',
  },
  {
    id: '7fc6ca11-452e-d3e4-9e1c-752ff615abea',
    name: 'snapshot-heavy',
    description: '',
    project_id: project.id,
    time_created: new Date().toISOString(),
    time_modified: new Date().toISOString(),
    size: 20 * GiB,
    disk_id: disks[3].id,
    state: 'ready',
  },
  {
    id: '3b252b04-d896-49d3-bae3-0ac102eed9b4',
    name: 'snapshot-max-size',
    description: '',
    project_id: project.id,
    time_created: new Date().toISOString(),
    time_modified: new Date().toISOString(),
    size: 1023 * GiB, // the biggest size allowed
    disk_id: disks[3].id,
    state: 'ready',
  },
  ...generatedSnapshots,
]

function generateSnapshot(index: number): Json<Snapshot> {
  return {
    id: uuid(),
    name: `disk-1-snapshot-${index + 8}`,
    description: '',
    project_id: project.id,
    time_created: new Date().toISOString(),
    time_modified: new Date().toISOString(),
    size: 1024 * (index + 1),
    disk_id: disks[0].id,
    state: 'ready',
  }
}
