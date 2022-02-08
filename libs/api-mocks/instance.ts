import type { Instance, InstanceResultsPage } from '@oxide/api'
import type { Json } from './json-type'
import { project } from './project'

export const instance: Json<Instance> = {
  ncpus: 7,
  memory: 1024 * 1024 * 256,
  name: 'db1',
  description: 'an instance',
  id: 'abc123',
  hostname: 'oxide.com',
  project_id: project.id,
  run_state: 'running',
  time_created: new Date().toISOString(),
  time_modified: new Date().toISOString(),
  time_run_state_updated: new Date().toISOString(),
}

export const instances: Json<InstanceResultsPage> = { items: [instance] }
