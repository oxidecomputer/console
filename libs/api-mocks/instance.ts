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
  timeCreated: new Date().toISOString(),
  timeModified: new Date().toISOString(),
  timeRunStateUpdated: new Date().toISOString(),
}

export const instances: InstanceResultsPage = { items: [instance] }
