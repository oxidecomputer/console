import type { Disk } from '@oxide/api'
import type { Json } from './json-type'
import { project } from './project'

export const disks: Json<Disk>[] = [
  {
    id: 'disk-id-1',
    name: 'disk-1',
    description: "it's a disk",
    project_id: project.id,
    time_created: new Date().toISOString(),
    time_modified: new Date().toISOString(),
    state: { state: 'attached', instance: 'abc123' },
    device_path: '/abc',
    size: 2048,
    block_size: 2048,
  },
  {
    id: 'disk-id-2',
    name: 'disk-2',
    description: "it's a second disk",
    project_id: project.id,
    time_created: new Date().toISOString(),
    time_modified: new Date().toISOString(),
    state: { state: 'attached', instance: 'abc123' },
    device_path: '/def',
    size: 4096,
    block_size: 2048,
  },
  {
    id: 'disk-id-3',
    name: 'disk-3',
    description: "it's a third disk",
    project_id: project.id,
    time_created: new Date().toISOString(),
    time_modified: new Date().toISOString(),
    state: { state: 'detached' },
    device_path: '/ghi',
    size: 6144,
    block_size: 2048,
  },
  {
    id: 'disk-id-4',
    name: 'disk-4',
    description: "it's a fourth disk",
    project_id: project.id,
    time_created: new Date().toISOString(),
    time_modified: new Date().toISOString(),
    state: { state: 'detached' },
    device_path: '/jkl',
    size: 8192,
    block_size: 2048,
  },
]
