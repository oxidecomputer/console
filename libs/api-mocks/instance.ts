import type { Instance, InstanceResultsPage } from '@oxide/api'
import { project } from './project'

export const instance: Instance = {
  ncpus: 7,
  memory: 1024 * 1024 * 256,
  name: 'db1',
  description: 'an instance',
  id: 'abc123',
  hostname: 'oxide.com',
  projectId: project.id,
  runState: 'running',
  timeCreated: new Date(),
  timeModified: new Date(),
  timeRunStateUpdated: new Date(),
}

export const instances: InstanceResultsPage = { items: [instance] }
