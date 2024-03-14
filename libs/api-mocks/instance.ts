/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import type { Instance } from '@oxide/api'

import type { Json } from './json-type'
import { project } from './project'

export const instance: Json<Instance> = {
  id: '935499b3-fd96-432a-9c21-83a3dc1eece4',
  name: 'db1',
  ncpus: 4,
  memory: 1024 * 1024 * 1024 * 16,
  description: 'an instance',
  hostname: 'oxide.com',
  project_id: project.id,
  run_state: 'running',
  time_created: new Date().toISOString(),
  time_modified: new Date().toISOString(),
  time_run_state_updated: new Date().toISOString(),
}

const failedInstance: Json<Instance> = {
  id: 'b5946edc-5bed-4597-88ab-9a8beb9d32a4',
  name: 'you-fail',
  ncpus: 8,
  memory: 1024 * 1024 * 1024 * 16,
  description: 'a failed instance',
  hostname: 'oxide.com',
  project_id: project.id,
  run_state: 'failed',
  time_created: new Date().toISOString(),
  time_modified: new Date().toISOString(),
  time_run_state_updated: new Date().toISOString(),
}

const startingInstance: Json<Instance> = {
  id: '16737f54-1f76-4c96-8b7c-9d24971c1d62',
  name: 'not-there-yet',
  ncpus: 2,
  memory: 1024 * 1024 * 1024 * 8,
  description: 'a starting instance',
  hostname: 'oxide.com',
  project_id: project.id,
  run_state: 'starting',
  time_created: new Date().toISOString(),
  time_modified: new Date().toISOString(),
  time_run_state_updated: new Date().toISOString(),
}

export const instances: Json<Instance>[] = [instance, failedInstance, startingInstance]
