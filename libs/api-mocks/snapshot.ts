import type { Snapshot } from '@oxide/api'

import { disks } from './disk'
import type { Json } from './json-type'
import { genId } from './msw/util'
import { project } from './project'

export const snapshots: Json<Snapshot>[] = [
  {
    id: genId('snapshot-1'),
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
    id: genId('snapshot-2'),
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
    id: genId('snapshot-3'),
    name: 'snapshot-3',
    description: "it's a third snapshot",
    project_id: project.id,
    time_created: new Date().toISOString(),
    time_modified: new Date().toISOString(),
    size: 3072,
    disk_id: disks[0].id,
    state: 'ready',
  },
  {
    id: genId('snapshot-4'),
    name: 'snapshot-4',
    description: "it's a fourth snapshot",
    project_id: project.id,
    time_created: new Date().toISOString(),
    time_modified: new Date().toISOString(),
    size: 4096,
    disk_id: disks[0].id,
    state: 'ready',
  },
]
