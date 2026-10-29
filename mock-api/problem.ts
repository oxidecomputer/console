/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { addDays, subHours } from 'date-fns'

import type { Problem, ProblemImpact, Alert } from '@oxide/api'

import { disk1 } from './disk'
import { instance } from './instance'
import type { Json } from './json-type'
import { physicalDisks } from './physical-disk'
import { rack } from './rack'
import { myriadSilo, thraxSilo } from './silo'
import { sleds } from './sled'
import { supportBundles } from './support-bundle'

// The only problem code Nexus defines is a placeholder for testing. These two
// problems use its title and docs text. Revisions start at 1, matching the
// generation number Nexus stores them as.
// https://github.com/oxidecomputer/omicron/blob/2a4a125/nexus/types/src/fm/problem.rs#L33-L77

const hoursAgo = (n: number) => subHours(new Date(), n).toISOString()

const notARealProblem = {
  code: 0,
  class: 'system',
  summary: 'Not a Real Problem',
  description: 'This is not a real problem. It exists only for testing purposes.',
  action_required:
    'If you encounter this problem in real life, this is a bug. Please contact Oxide support.',
}

export const testProblem: Json<Problem> = {
  ...notARealProblem,
  id: '316089b7-593c-4995-bea7-a19c8526b13d',
  state: 'active',
  revision: 1,
  time_created: hoursAgo(5),
  time_modified: hoursAgo(5),
}

export const resolvedTestProblem: Json<Problem> = {
  ...notARealProblem,
  id: 'c9964ac4-747e-4357-a037-95415c65b42a',
  state: 'resolved',
  revision: 2,
  time_created: hoursAgo(24 * 3),
  time_modified: hoursAgo(24 * 2),
  time_resolved: hoursAgo(24 * 2),
}

// Everything below is invented. No diagnosis engine creates problems
// yet, and Nexus doesn't record impacts, relations, support bundles, or alerts
// for problems (those endpoints return empty lists). Where a problem is based
// on a diagnosis engine that exists, the comment links it. The rest follow
// examples in RFD 699, to give the UI some causes and consequences to show,
// since no real engine relates problems yet.
// https://github.com/oxidecomputer/omicron/blob/2a4a125/nexus/src/app/problem.rs#L61-L121
// https://rfd.shared.oxide.computer/rfd/0699

// PhysicalDisk DE: opens a case when an in-service disk's zpool health in
// inventory isn't Online, closes when it's Online again or the disk leaves
// service. It's also the DE named in the FM-created support bundle fixture.
// https://github.com/oxidecomputer/omicron/blob/271efb2/nexus/fm/src/diagnosis/physical_disk.rs
export const diskFaultedProblem: Json<Problem> = {
  id: 'ddafcbf2-4997-488a-996f-89bbfb452d68',
  code: 12,
  class: 'hardware.disk',
  summary: 'Physical disk faulted',
  description:
    'The zpool on physical disk 0C98MRMBK64 in sled BRM02222869 reports FAULTED health: too few replicas remain to keep it online.',
  action_required:
    'Replace the physical disk. This problem resolves when the replacement is in service or the disk is expunged.',
  state: 'active',
  revision: 2,
  time_created: hoursAgo(5),
  time_modified: hoursAgo(4),
}

// PowerShelf DE: opens a case per PSU slot on a PSU remove ereport, keeps it
// open until the PSC reports every PSU present again.
// https://github.com/oxidecomputer/omicron/blob/271efb2/nexus/fm/src/diagnosis/power_shelf.rs
export const psuRemovedProblem: Json<Problem> = {
  id: '99df5b0f-6f42-4a37-ac41-66fb6b402699',
  code: 41,
  class: 'hardware.power_shelf',
  summary: 'Power supply removed',
  description: 'The power supply unit in slot 2 of power shelf 0 is no longer present.',
  action_required:
    'Reinsert or replace the power supply unit. This problem resolves when the power shelf reports the PSU present again.',
  state: 'active',
  revision: 2,
  time_created: hoursAgo(30),
  time_modified: hoursAgo(29),
}

// Not based on a DE. RFD 699 §5.2's example of a problem caused by another.
export const powerRedundancyProblem: Json<Problem> = {
  id: 'e06e3ed9-624e-4085-9d66-267757550a5a',
  code: 42,
  class: 'hardware.power_shelf',
  summary: 'Reduced power redundancy',
  description:
    'Power shelf 0 is running with fewer power supplies than its redundancy configuration requires. Losing another power supply may power off the rack.',
  action_required:
    'Resolve the problems causing this one. This problem resolves when redundancy is restored.',
  state: 'active',
  revision: 1,
  time_created: hoursAgo(29),
  time_modified: hoursAgo(29),
}

// Saga DE: opens a case for a saga with no progress in 30 minutes, one owned
// by a Nexus that's no longer current, or one that was abandoned.
// https://github.com/oxidecomputer/omicron/blob/271efb2/nexus/fm/src/diagnosis/saga.rs
export const sagaStuckProblem: Json<Problem> = {
  id: 'aa2f8abb-75f8-43ad-bc58-27e6ed8b1d40',
  code: 90,
  class: 'system',
  summary: 'Control plane operation not progressing',
  description:
    'An internal control plane operation (instance-start) has not made progress in over 30 minutes.',
  action_required: 'Contact Oxide support.',
  state: 'active',
  revision: 1,
  time_created: hoursAgo(3),
  time_modified: hoursAgo(3),
}

// Certificate DE: opens a case per silo when the certificate it serves is near
// expiry or expired, closes when a later-expiring certificate is uploaded.
// Description text adapted from the alert payload docs.
// https://github.com/oxidecomputer/omicron/blob/271efb2/nexus/fm/src/diagnosis/certificate.rs
// https://github.com/oxidecomputer/omicron/blob/271efb2/nexus/types/src/alert/certificate.rs
export const certExpiringProblem: Json<Problem> = {
  id: 'fb27a476-8c58-44e8-8363-fed5258ebef8',
  code: 60,
  class: 'system',
  summary: 'Silo TLS certificate expiring',
  description:
    "The TLS certificate served for silo myriad's external API expires in 12 days, and no later-expiring certificate is installed for the silo.",
  action_required:
    'Upload a new certificate for the silo. This problem resolves when a certificate with a later expiration time is installed.',
  state: 'active',
  revision: 1,
  time_created: hoursAgo(24 * 2),
  time_modified: hoursAgo(24 * 2),
}

export const certExpiredProblem: Json<Problem> = {
  id: '3d985ee9-df51-42c7-8477-c7593cce6a4a',
  code: 61,
  class: 'system',
  summary: 'Silo TLS certificate expired',
  description:
    "The TLS certificate served for silo thrax's external API has expired, and no later-expiring certificate is installed for the silo. Nexus continues to serve the expired certificate so an operator can still connect and upload a replacement.",
  action_required:
    'Upload a new certificate for the silo. This problem resolves when a certificate with a later expiration time is installed.',
  state: 'resolved',
  revision: 2,
  time_created: hoursAgo(24 * 9),
  time_modified: hoursAgo(24 * 8),
  time_resolved: hoursAgo(24 * 8),
}

// Not based on a DE. RFD 699's impact list example, resolved here so the
// Resolved tab has a cause and consequence too.
export const sledUnavailableProblem: Json<Problem> = {
  id: 'd5b7fbc4-ff40-4f6b-9f1b-07a16f28fd2b',
  code: 20,
  class: 'hardware.sled',
  summary: 'Sled unavailable',
  description:
    'Sled BRM02222870 stopped responding to the control plane. Instances on the sled will be restarted on other sleds.',
  action_required: 'Contact Oxide support.',
  state: 'resolved',
  revision: 3,
  time_created: hoursAgo(24 * 6),
  time_modified: hoursAgo(24 * 5),
  time_resolved: hoursAgo(24 * 5),
}

export const readOnlyDiskProblem: Json<Problem> = {
  id: 'fcb0a8a9-adae-4151-81f3-c7f20192e2bb',
  code: 70,
  class: 'virtual.disk.distributed',
  summary: 'Distributed disk read-only',
  description:
    'A distributed disk lost a replica on an unavailable sled and is read-only until the replica is rebuilt.',
  action_required: 'No action is required. The system will rebuild the replica.',
  state: 'resolved',
  revision: 2,
  time_created: hoursAgo(24 * 6),
  time_modified: hoursAgo(24 * 5.5),
  time_resolved: hoursAgo(24 * 5.5),
}

export const problems: Json<Problem>[] = [
  testProblem,
  resolvedTestProblem,
  diskFaultedProblem,
  psuRemovedProblem,
  powerRedundancyProblem,
  sagaStuckProblem,
  certExpiringProblem,
  certExpiredProblem,
  sledUnavailableProblem,
  readOnlyDiskProblem,
]

// The PSU, power shelf, and saga problems have no impacts: none of those
// things is an API resource that ImpactedResource can point to.
export const problemImpacts: Json<ProblemImpact>[] = [
  {
    problem_id: diskFaultedProblem.id,
    resource: { resource_type: 'physical_disk', id: physicalDisks[0].id },
    reason: 'Disk taken out of service',
    revision_added: 1,
  },
  {
    problem_id: diskFaultedProblem.id,
    resource: { resource_type: 'sled', id: sleds[0].id },
    reason: 'Running with one fewer disk',
    revision_added: 2,
  },
  {
    problem_id: certExpiringProblem.id,
    resource: { resource_type: 'silo', id: myriadSilo.id },
    reason: 'TLS certificate expires soon',
    revision_added: 1,
  },
  {
    problem_id: certExpiredProblem.id,
    resource: { resource_type: 'silo', id: thraxSilo.id },
    reason: 'TLS certificate expired',
    revision_added: 1,
  },
  {
    problem_id: sledUnavailableProblem.id,
    resource: { resource_type: 'sled', id: sleds[1].id },
    reason: 'Sled unavailable',
    revision_added: 1,
  },
  {
    problem_id: sledUnavailableProblem.id,
    resource: { resource_type: 'instance', id: instance.id },
    reason: 'The sled this instance was on has failed. The instance will be restarted.',
    revision_added: 2,
  },
  {
    problem_id: readOnlyDiskProblem.id,
    resource: { resource_type: 'disk', id: disk1.id },
    reason: 'Disk is read-only until a replica is rebuilt',
    revision_added: 1,
  },
]

/**
 * Edge in the causality graph. `revision_added` is the revision of each side
 * in which the edge appeared, since the API reports it relative to the problem
 * being viewed.
 */
export type DbProblemRelation = {
  cause_id: string
  consequence_id: string
  reason: string
  cause_revision_added: number
  consequence_revision_added: number
}

export const problemRelations: DbProblemRelation[] = [
  {
    cause_id: psuRemovedProblem.id,
    consequence_id: powerRedundancyProblem.id,
    reason: 'Missing PSU reduced power shelf redundancy',
    cause_revision_added: 2,
    consequence_revision_added: 1,
  },
  {
    cause_id: sledUnavailableProblem.id,
    consequence_id: readOnlyDiskProblem.id,
    reason: 'Disk had a replica on the unavailable sled',
    cause_revision_added: 3,
    consequence_revision_added: 1,
  },
]

export const problemSupportBundles: { problem_id: string; bundle_id: string }[] = [
  // the bundle whose reason_for_creation names the PhysicalDisk diagnosis engine
  { problem_id: diskFaultedProblem.id, bundle_id: supportBundles[1].id },
]

type ProblemAlert = { problem_id: string; alert: Json<Alert> }

// Alert classes follow RFD 699 §7.3.1: active_problem.<event>.<problem class>.
// The payload schema isn't defined yet, so this one is a guess.
const problemAlert = (
  id: string,
  problem: Json<Problem>,
  event: 'detected' | 'updated' | 'resolved',
  revision: number,
  time: string
): ProblemAlert => ({
  problem_id: problem.id,
  alert: {
    id,
    class: `active_problem.${event}.${problem.class}`,
    version: 0,
    payload: { problem_id: problem.id, revision, code: problem.code },
    time_created: time,
    time_modified: time,
  },
})

const problemAlertFixtures: ProblemAlert[] = [
  problemAlert(
    'da7aab5f-d140-40bc-b6c1-283b70686535',
    diskFaultedProblem,
    'detected',
    1,
    hoursAgo(5)
  ),
  problemAlert(
    '3e61b025-d27e-4cf8-a78c-b96ba06dd8b0',
    diskFaultedProblem,
    'updated',
    2,
    hoursAgo(4)
  ),
  // the alert the PowerShelf DE already requests, so the problem's alert list
  // mixes FM lifecycle alerts with the underlying hardware event. v0 payload:
  // https://github.com/oxidecomputer/omicron/blob/271efb2/nexus/types/src/alert/power_shelf.rs
  {
    problem_id: psuRemovedProblem.id,
    alert: {
      id: '7c8f7cde-24c6-4e64-9b8c-632130f47735',
      class: 'hardware.power_shelf.psu.remove',
      version: 0,
      payload: {
        rack_id: rack.id,
        power_shelf: {
          shelf: 0,
          baseboard: { part: '913-0000019', revision: 6, serial: 'BRM42220081' },
        },
        psu: {
          slot: 2,
          identity: {
            manufacturer: 'Murata',
            part: 'MWOCP68-3600-D-RM',
            serial: 'M5426000102',
            firmware_revision: '1.9',
          },
        },
        time: hoursAgo(30),
      },
      time_created: hoursAgo(30),
      time_modified: hoursAgo(30),
    },
  },
  problemAlert(
    'acf19f1c-4c7e-489c-a350-f6195aaf13ae',
    psuRemovedProblem,
    'detected',
    1,
    hoursAgo(30)
  ),
  problemAlert(
    '2ead1826-3b11-4ff2-9c4e-c401fcfcdd36',
    psuRemovedProblem,
    'updated',
    2,
    hoursAgo(29)
  ),
  problemAlert(
    '007834b5-72ec-4444-89a2-ba14402ccd90',
    powerRedundancyProblem,
    'detected',
    1,
    hoursAgo(29)
  ),
  problemAlert(
    'aed24ee0-fc83-43a0-87a9-da7dc1644a19',
    sagaStuckProblem,
    'detected',
    1,
    hoursAgo(3)
  ),
  // the alert the Certificate DE already requests. v0 payload:
  // https://github.com/oxidecomputer/omicron/blob/271efb2/nexus/types/src/alert/certificate.rs
  {
    problem_id: certExpiringProblem.id,
    alert: {
      id: '5b4d0ac4-91ff-45a9-84b2-11265a527a0b',
      class: 'silo.certificate.expiring',
      version: 0,
      payload: {
        time: hoursAgo(24 * 2),
        silo: { id: myriadSilo.id, name: myriadSilo.name },
        certificate: {
          id: '39c441bc-0bef-4758-8134-8df7611a62ad',
          name: 'myriad-2025',
          not_after: addDays(new Date(), 12).toISOString(),
        },
      },
      time_created: hoursAgo(24 * 2),
      time_modified: hoursAgo(24 * 2),
    },
  },
  problemAlert(
    'ca7d1f7d-bcea-4c1d-ad64-89200861864d',
    certExpiringProblem,
    'detected',
    1,
    hoursAgo(24 * 2)
  ),
  problemAlert(
    'dd736aa1-8362-4f90-9831-15920c30a421',
    certExpiredProblem,
    'detected',
    1,
    hoursAgo(24 * 9)
  ),
  problemAlert(
    '16b9a48a-2aed-4cb7-942f-30ee717479f5',
    certExpiredProblem,
    'resolved',
    2,
    hoursAgo(24 * 8)
  ),
  problemAlert(
    '89a344d4-5e16-40f4-844d-5b5055043228',
    sledUnavailableProblem,
    'detected',
    1,
    hoursAgo(24 * 6)
  ),
  problemAlert(
    'bc4201cd-402b-44df-9e54-d5c7f427e049',
    sledUnavailableProblem,
    'resolved',
    3,
    hoursAgo(24 * 5)
  ),
  problemAlert(
    'ee719d0f-3b72-4b0b-b631-dabfa37d0eaf',
    readOnlyDiskProblem,
    'detected',
    1,
    hoursAgo(24 * 6)
  ),
  problemAlert(
    'b7d17660-05ca-4996-a4c5-414ca1871aa0',
    readOnlyDiskProblem,
    'resolved',
    2,
    hoursAgo(24 * 5.5)
  ),
]

/** Included in the main `alerts` fixture, like any other alert */
export const problemAlerts = problemAlertFixtures.map((a) => a.alert)

export const problemAlertIds = problemAlertFixtures.map(({ problem_id, alert }) => ({
  problem_id,
  alert_id: alert.id,
}))
