import type { Disk, DiskResultsPage } from '@oxide/api'
import type { Json } from './json-type'
import { project } from './project'

export const disk: Json<Disk> = {
  id: 'disk-id',
  name: 'disk-name',
  description: "it's a disk",
  project_id: project.id,
  time_created: new Date().toISOString(),
  time_modified: new Date().toISOString(),
  state: { state: 'detached' },
  device_path: '/uh',
  size: 1000,
}

export const disks: Json<DiskResultsPage> = { items: [disk] }
