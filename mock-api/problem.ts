/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import type { Problem, ProblemImpact } from '@oxide/api'

import { disk1 } from './disk'
import { instance } from './instance'
import type { Json } from './json-type'
import { physicalDisks } from './physical-disk'
import { sleds } from './sled'

// Problem codes and classes as defined in Nexus. Only codes 1 (Unhealthy
// Zpool, hardware.disk) and 2 (Service in Maintainence, system) exist so far.
// https://github.com/oxidecomputer/omicron/blob/e11a929/nexus/types/src/fm/problem.rs#L33-L36
//
// Nexus doesn't create problems yet, so we'll need to revisit this (and the text here) once it does.

export const problemDisk: Json<Problem> = {
  id: 'e9f6b993-b8fb-4e26-a7d8-dbf0c4dc948d',
  class: 'hardware.disk',
  code: 1,
  summary: 'Unhealthy zpool',
  description:
    'The zpool on a U.2 disk is in a degraded state. Virtual disks with data on this disk have reduced redundancy.',
  action_required: 'Expunge the disk and replace it.',
  revision: 3,
  state: 'active',
  time_created: new Date('2025-08-01T09:00:00Z').toISOString(),
  time_modified: new Date('2025-08-01T10:30:00Z').toISOString(),
  time_state_changed: new Date('2025-08-01T09:00:00Z').toISOString(),
}

export const problemService: Json<Problem> = {
  id: '36d8900f-ab1f-4826-a1e5-75932b90f5fe',
  class: 'system',
  code: 2,
  summary: 'Service in maintenance',
  description: 'An SMF service on the sled is in the maintenance state.',
  action_required: 'No action required. This resolves when the faulty disk is replaced.',
  revision: 1,
  state: 'active',
  time_created: new Date('2025-08-01T09:05:00Z').toISOString(),
  time_modified: new Date('2025-08-01T09:05:00Z').toISOString(),
  time_state_changed: new Date('2025-08-01T09:05:00Z').toISOString(),
}

export const problemResolved: Json<Problem> = {
  id: '8643ac12-a5da-43d4-b714-f05238ef18c8',
  class: 'system',
  code: 2,
  summary: 'Service in maintenance',
  description: 'An SMF service on two sleds was in the maintenance state.',
  action_required: 'No action required.',
  revision: 4,
  state: 'resolved',
  time_created: new Date('2025-07-20T08:00:00Z').toISOString(),
  time_modified: new Date('2025-07-20T12:00:00Z').toISOString(),
  time_state_changed: new Date('2025-07-20T12:00:00Z').toISOString(),
}

export const problems: Json<Problem>[] = [problemDisk, problemService, problemResolved]

export const problemImpacts: Json<ProblemImpact>[] = [
  {
    problem_id: problemDisk.id,
    resource: { resource_type: 'physical_disk', id: physicalDisks[0].id },
    reason: 'Disk is faulty',
    state: 'active',
    revision_added: 1,
    time_detected: problemDisk.time_created,
    time_state_changed: problemDisk.time_created,
  },
  {
    problem_id: problemDisk.id,
    resource: { resource_type: 'disk', id: disk1.id },
    reason: 'Virtual disk has reduced redundancy',
    state: 'active',
    revision_added: 2,
    time_detected: new Date('2025-08-01T09:20:00Z').toISOString(),
    time_state_changed: new Date('2025-08-01T09:20:00Z').toISOString(),
  },
  {
    problem_id: problemDisk.id,
    resource: { resource_type: 'instance', id: instance.id },
    reason: 'Instance had degraded disk performance',
    state: 'recovered',
    revision_added: 2,
    time_detected: new Date('2025-08-01T09:20:00Z').toISOString(),
    time_state_changed: problemDisk.time_modified,
  },
  {
    problem_id: problemService.id,
    resource: { resource_type: 'sled', id: sleds[0].id },
    reason: 'A service on the sled is in maintenance',
    state: 'active',
    revision_added: 1,
    time_detected: problemService.time_created,
    time_state_changed: problemService.time_created,
  },
  {
    problem_id: problemResolved.id,
    resource: { resource_type: 'sled', id: sleds[1].id },
    reason: 'A service on the sled was in maintenance',
    state: 'recovered',
    revision_added: 1,
    time_detected: problemResolved.time_created,
    time_state_changed: problemResolved.time_state_changed,
  },
  {
    // sleds[2] is the expunged sled
    problem_id: problemResolved.id,
    resource: { resource_type: 'sled', id: sleds[2].id },
    reason: 'A service on the sled was in maintenance',
    state: 'out_of_service',
    revision_added: 1,
    time_detected: problemResolved.time_created,
    time_state_changed: new Date('2025-07-20T10:00:00Z').toISOString(),
  },
]

/** One row per cause → consequence edge between two problems */
export type ProblemRelation = {
  cause_id: string
  consequence_id: string
  reason: string
  /** The API reports one revision per side of the relationship */
  cause_revision_added: number
  consequence_revision_added: number
}

export const problemRelations: ProblemRelation[] = [
  {
    cause_id: problemDisk.id,
    consequence_id: problemService.id,
    reason: 'The service uses the unhealthy zpool',
    cause_revision_added: 2,
    consequence_revision_added: 1,
  },
]

// IDs are from the fixtures in alert.ts and support-bundle.ts. The only alert
// fixtures are PSU alerts, which do not match the problems they are linked to.
export const problemAlerts: { problem_id: string; alert_id: string }[] = [
  { problem_id: problemService.id, alert_id: '8c8a74ba-58b7-4a06-8c79-39ccad5624fb' },
  { problem_id: problemService.id, alert_id: '81dd4626-d7ef-435e-8f4d-f3f2a1217e59' },
  { problem_id: problemResolved.id, alert_id: '5a2009af-26a0-4217-b18f-bd4e25e691b9' },
]

export const problemSupportBundles: { problem_id: string; bundle_id: string }[] = [
  { problem_id: problemDisk.id, bundle_id: '7bdd4ef3-8183-46fe-9e9f-81b34bf6b2c5' },
]
