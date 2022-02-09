import type { Disk } from '@oxide/api'
import type { Json } from './json-type'
import { project } from './project'

export const disk: Json<Disk> = {
  id: 'disk-id',
  name: 'disk-name',
  description: "it's a disk",
  project_id: project.id,
  time_created: new Date().toISOString(),
  time_modified: new Date().toISOString(),
  state: { state: 'attached', instance: 'abc123' },
  device_path: '/uh',
  size: 1000,
}
