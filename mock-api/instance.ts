/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import type { Instance } from '@oxide/api'

import { GiB } from '~/util/units'

import type { Json } from './json-type'
import { project } from './project'

const base = {
  time_created: new Date().toISOString(),
  time_modified: new Date().toISOString(),
  time_run_state_updated: new Date().toISOString(),
  auto_restart_enabled: true,
}

export const instance: Json<Instance> = {
  ...base,
  id: '935499b3-fd96-432a-9c21-83a3dc1eece4',
  name: 'db1',
  ncpus: 2,
  memory: 4 * GiB,
  description: 'an instance',
  hostname: 'oxide.com',
  project_id: project.id,
  run_state: 'running',
  boot_disk_id: '7f2309a5-13e3-47e0-8a4c-2a3b3bc992fd', // disk-1
}

const failedInstance: Json<Instance> = {
  ...base,
  id: 'b5946edc-5bed-4597-88ab-9a8beb9d32a4',
  name: 'you-fail',
  ncpus: 4,
  memory: 6 * GiB,
  description: 'a failed instance',
  hostname: 'oxide.com',
  project_id: project.id,
  run_state: 'failed',
  auto_restart_cooldown_expiration: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 mins in the future
}

const startingInstance: Json<Instance> = {
  ...base,
  id: '16737f54-1f76-4c96-8b7c-9d24971c1d62',
  name: 'not-there-yet',
  ncpus: 2,
  memory: 8 * GiB,
  description: 'a starting instance',
  hostname: 'oxide.com',
  project_id: project.id,
  run_state: 'starting',
}

export const instances: Json<Instance>[] = [instance, failedInstance, startingInstance]
