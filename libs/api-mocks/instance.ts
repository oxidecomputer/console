import type { Instance } from '@oxide/api'
import { InstanceState } from '@oxide/api'

export const instance: Instance = {
  ncpus: 7,
  memory: 1024 * 1024 * 256,
  name: 'db1',
  description: 'an instance',
  id: 'abc123',
  hostname: 'oxide.com',
  projectId: 'def456',
  runState: InstanceState.Running,
  timeCreated: new Date().toISOString(),
  timeModified: new Date().toISOString(),
  timeRunStateUpdated: new Date().toISOString(),
}
