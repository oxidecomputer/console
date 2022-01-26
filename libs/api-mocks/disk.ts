import type { DiskJSON, DiskResultsPageJSON } from '@oxide/api'
import { project } from './project'

export const disk: DiskJSON = {
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

export const disks: DiskResultsPageJSON = { items: [disk] }
