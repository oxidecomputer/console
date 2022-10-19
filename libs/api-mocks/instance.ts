import type { Instance, InstanceResultsPage } from '@oxide/api'

import type { Json } from './json-type'
import { genId } from './msw/util'
import { project } from './project'

export const instance: Json<Instance> = {
  id: <uuid>,
  name: 'db1',
  ncpus: 7,
  memory: 1024 * 1024 * 256,
  description: 'an instance',
  hostname: 'oxide.com',
  project_id: project.id,
  run_state: 'running',
  time_created: new Date().toISOString(),
  time_modified: new Date().toISOString(),
  time_run_state_updated: new Date().toISOString(),
}

export const instances: Json<InstanceResultsPage> = { items: [instance] }
