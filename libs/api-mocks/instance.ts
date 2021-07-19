import type { InstanceView } from '@oxide/api'
import { InstanceState } from '@oxide/api'

export const instance: InstanceView = {
  ncpus: 7,
  memory: 1024 * 1024 * 256,
  name: 'db1',
  description: 'an instance',
  id: 'abc123',
  hostname: 'oxide.com',
  projectId: 'def456',
  runState: InstanceState.Running,
  timeCreated: new Date(),
  timeModified: new Date(),
  timeRunStateUpdated: new Date(),
}
