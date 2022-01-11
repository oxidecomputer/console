import type { Disk, DiskResultsPage } from '@oxide/api'
import { project } from './project'

export const disk: Disk = {
  id: 'disk-id',
  name: 'disk-name',
  description: "it's a disk",
  projectId: project.id,
  timeCreated: new Date().toISOString(),
  timeModified: new Date().toISOString(),
  state: { state: 'detached' },
  devicePath: '/uh',
  size: 1000,
}

export const disks: DiskResultsPage = { items: [disk] }
