/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { addMinutes } from 'date-fns'

import type { Instance } from '@oxide/api'

import { GiB } from '~/util/units'

import type { Json } from './json-type'
import { project, project2 } from './project'

const base = {
  time_created: new Date().toISOString(),
  time_modified: new Date().toISOString(),
  time_run_state_updated: new Date().toISOString(),
  auto_restart_enabled: true,
  ncpus: 2,
  memory: 4 * GiB,
}

export const instance: Json<Instance> = {
  ...base,
  id: '935499b3-fd96-432a-9c21-83a3dc1eece4',
  name: 'db1',
  description: 'an instance',
  hostname: 'oxide.com',
  project_id: project.id,
  run_state: 'running',
  boot_disk_id: '7f2309a5-13e3-47e0-8a4c-2a3b3bc992fd', // disk-1: needs to be written out here to reduce circular dependencies
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
  auto_restart_cooldown_expiration: addMinutes(new Date(), 5).toISOString(), // 5 minutes from now
  time_last_auto_restarted: addMinutes(new Date(), -55).toISOString(), // 55 minutes ago
}

export const startingInstance: Json<Instance> = {
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

// failed instances in other-project for testing auto restart popover

const failedRestartingSoon: Json<Instance> = {
  ...base,
  id: 'a2fddf77-c053-4648-9cda-19976c395059',
  name: 'failed-restarting-soon',
  description: 'a failed instance',
  hostname: 'oxide.com',
  project_id: project2.id,

  auto_restart_enabled: true,
  run_state: 'failed',
  auto_restart_cooldown_expiration: addMinutes(new Date(), -0.5).toISOString(), // 30 seconds ago
  time_last_auto_restarted: addMinutes(new Date(), -60.5).toISOString(), // hour and 30 secs ago
}

const failedRestartNever: Json<Instance> = {
  ...base,
  id: 'ad8d6f3f-d0c9-4a7f-aecf-2af267483dab',
  name: 'failed-restart-never',
  description: 'a failed instance',
  hostname: 'oxide.com',
  project_id: project2.id,

  auto_restart_enabled: false,
  auto_restart_policy: 'never',
  run_state: 'failed',
  auto_restart_cooldown_expiration: addMinutes(new Date(), 5).toISOString(), // 5 minutes from now
  time_last_auto_restarted: addMinutes(new Date(), -55).toISOString(), // 55 minutes ago
}

const failedCooledRestartNever: Json<Instance> = {
  ...base,
  id: '32a0249f-3a5c-4d30-a154-2476e372aa62',
  name: 'failed-cooled-restart-never',
  description: 'a failed instance',
  hostname: 'oxide.com',
  project_id: project2.id,

  auto_restart_enabled: false,
  auto_restart_policy: 'never',
  run_state: 'failed',
  auto_restart_cooldown_expiration: addMinutes(new Date(), -5).toISOString(), // 5 minutes ago
  time_last_auto_restarted: addMinutes(new Date(), -65).toISOString(), // 65 minutes ago
}

export const instanceDb2: Json<Instance> = {
  ...base,
  id: 'e78b49c0-e534-400c-adca-a18cc9ab0d8c',
  name: 'db2',
  description: 'a second database instance',
  hostname: 'oxide.com',
  project_id: project.id,
  run_state: 'running',
  boot_disk_id: '48f94570-60d8-401c-857f-5bf912d2d3fc', // disk-2: needs to be written out here to reduce circular dependencies
}

export const instances: Json<Instance>[] = [
  instance,
  failedInstance,
  startingInstance,
  failedRestartingSoon,
  failedRestartNever,
  failedCooledRestartNever,
  instanceDb2,
]
