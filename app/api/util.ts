/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import * as R from 'remeda'

import { bytesToGiB } from '~/util/units'

import type {
  Disk,
  DiskState,
  Instance,
  InstanceState,
  IpPoolUtilization,
  Measurement,
  SiloUtilization,
  Sled,
  VpcFirewallRule,
  VpcFirewallRuleUpdate,
} from './__generated__/Api'

// API limits encoded in https://github.com/oxidecomputer/omicron/blob/main/nexus/src/app/mod.rs

export const MAX_NICS_PER_INSTANCE = 8

export const INSTANCE_MAX_CPU = 64
export const INSTANCE_MIN_RAM_GiB = 1
export const INSTANCE_MAX_RAM_GiB = 256

export const MIN_DISK_SIZE_GiB = 1
/**
 * Disk size limited to 1023  as that's the maximum we can safely allocate right now
 * @see https://github.com/oxidecomputer/omicron/issues/3212#issuecomment-1634497344
 */
export const MAX_DISK_SIZE_GiB = 1023

type PortRange = [number, number]

/** Parse '1234' into [1234, 1234] and '80-100' into [80, 100] */
// TODO: parsing should probably throw errors rather than returning
// null so we can annotate the failure with a reason
export function parsePortRange(portRange: string): PortRange | null {
  // TODO: pull pattern from openapi spec (requires generator work)
  const match = /^([0-9]{1,5})((?:-)[0-9]{1,5})?$/.exec(portRange.trim())
  if (!match) return null

  const p1 = parseInt(match[1], 10)
  // API treats a single port as a range with the same start and end
  const p2 = match[2] ? parseInt(match[2].slice(1), 10) : p1

  if (p2 < p1) return null

  return [p1, p2]
}

export const firewallRuleGetToPut = (
  rule: VpcFirewallRule
): NoExtraKeys<VpcFirewallRuleUpdate, VpcFirewallRule> =>
  R.pick(rule, [
    'name',
    'action',
    'description',
    'direction',
    'filters',
    'priority',
    'status',
    'targets',
  ])

/**
 * Generates a valid name given a list of strings. Must be given at least
 * one string. If multiple strings are given, they will be truncated to
 * equal lengths (if the result would be over the maximum 63 character limit)
 * and a 6-character random string will be appended to the end.
 */
export const genName = (...parts: [string, ...string[]]) => {
  const numParts = parts.length
  const partLength = Math.floor(63 / numParts) - Math.ceil(6 / numParts) - 1
  return (
    parts
      .map((part) => part.substring(0, partLength))
      .join('-')
      // generate random hex string of 6 characters
      .concat(`-${Math.random().toString(16).substring(2, 8)}`)
  )
}

const instanceActions = {
  // NoVmm maps to to Stopped:
  // https://github.com/oxidecomputer/omicron/blob/6dd9802/nexus/db-model/src/instance_state.rs#L55

  // https://github.com/oxidecomputer/omicron/blob/0496637/nexus/src/app/instance.rs#L2064
  start: ['stopped', 'failed'],

  // https://github.com/oxidecomputer/omicron/blob/6dd9802/nexus/db-queries/src/db/datastore/instance.rs#L865
  delete: ['stopped', 'failed'],

  // https://github.com/oxidecomputer/omicron/blob/3093818/nexus/db-queries/src/db/datastore/instance.rs#L1030-L1043
  update: ['stopped', 'failed', 'creating'],

  // reboot and stop are kind of weird!
  // https://github.com/oxidecomputer/omicron/blob/6dd9802/nexus/src/app/instance.rs#L790-L798
  // https://github.com/oxidecomputer/propolis/blob/b278193/bin/propolis-server/src/lib/vm/request_queue.rs
  // https://github.com/oxidecomputer/console/pull/2387#discussion_r1722368236
  reboot: ['running'], // technically rebooting allowed but too weird to say it
  // stopping a failed disk: https://github.com/oxidecomputer/omicron/blob/f0b804818b898bebdb317ac2b000618944c02457/nexus/src/app/instance.rs#L818-L830
  stop: ['running', 'starting', 'rebooting', 'failed'],

  // https://github.com/oxidecomputer/omicron/blob/6dd9802/nexus/db-queries/src/db/datastore/disk.rs#L323-L327
  detachDisk: ['creating', 'stopped', 'failed'],
  // only Creating and NoVmm
  // https://github.com/oxidecomputer/omicron/blob/6dd9802/nexus/db-queries/src/db/datastore/disk.rs#L185-L188
  attachDisk: ['creating', 'stopped'],
  // primary nic: https://github.com/oxidecomputer/omicron/blob/6dd9802/nexus/db-queries/src/db/datastore/network_interface.rs#L761-L765
  // non-primary: https://github.com/oxidecomputer/omicron/blob/6dd9802/nexus/db-queries/src/db/datastore/network_interface.rs#L806-L810
  updateNic: ['stopped'],
  // https://github.com/oxidecomputer/omicron/blob/6dd9802/nexus/src/app/instance.rs#L1520-L1522
  serialConsole: ['running', 'rebooting', 'migrating', 'repairing'],
} satisfies Record<string, InstanceState[]>

// setting .states is a cute way to make it ergonomic to call the test function
// while also making the states available directly

export const instanceCan = R.mapValues(instanceActions, (states: InstanceState[]) => {
  const test = (i: { runState: InstanceState }) => states.includes(i.runState)
  test.states = states
  return test
})

export function instanceTransitioning({ runState }: Instance) {
  return (
    runState === 'creating' ||
    runState === 'starting' ||
    runState === 'stopping' ||
    runState === 'rebooting'
  )
}

const diskActions = {
  // this is a weird one because the list of states is dynamic and it includes
  // 'creating' in the unwind of the disk create saga, but does not include
  // 'creating' in the disk delete saga, which is what we care about
  // https://github.com/oxidecomputer/omicron/blob/6dd9802/nexus/src/app/sagas/disk_delete.rs?plain=1#L110
  delete: ['detached', 'faulted'],
  // TODO: link to API source. It's hard to determine from the saga code what the rule is here.
  snapshot: ['attached', 'detached'],
  // https://github.com/oxidecomputer/omicron/blob/6dd9802/nexus/db-queries/src/db/datastore/disk.rs#L173-L176
  attach: ['creating', 'detached'],
  // https://github.com/oxidecomputer/omicron/blob/6dd9802/nexus/db-queries/src/db/datastore/disk.rs#L313-L314
  detach: ['attached'],
  // https://github.com/oxidecomputer/omicron/blob/3093818/nexus/db-queries/src/db/datastore/instance.rs#L1077-L1081
  setAsBootDisk: ['attached'],
} satisfies Record<string, DiskState['state'][]>

export const diskCan = R.mapValues(diskActions, (states: DiskState['state'][]) => {
  // only have to Pick because we want this to work for both Disk and
  // Json<Disk>, which we pass to it in the MSW handlers
  const test = (d: Pick<Disk, 'state'>) => states.includes(d.state.state)
  test.states = states
  return test
})

/** Hard coded in the API, so we can hard code it here. */
export const FLEET_ID = '001de000-1334-4000-8000-000000000000'

const TBtoTiB = 0.909
const FUDGE = 0.7

export function totalCapacity(
  sleds: Pick<Sled, 'usableHardwareThreads' | 'usablePhysicalRam'>[]
) {
  return {
    disk_tib: Math.ceil(FUDGE * sleds.length * 32 * TBtoTiB), // TODO: make more real
    ram_gib: Math.ceil(bytesToGiB(FUDGE * R.sumBy(sleds, (s) => s.usablePhysicalRam))),
    cpu: Math.ceil(FUDGE * R.sumBy(sleds, (s) => s.usableHardwareThreads)),
  }
}

export function totalUtilization(siloUtilizationListItems: SiloUtilization[]) {
  const totalAllocated = { cpus: 0, memory: 0, storage: 0 }
  const totalProvisioned = { cpus: 0, memory: 0, storage: 0 }

  siloUtilizationListItems.forEach(({ allocated, provisioned }) => {
    totalProvisioned.cpus += provisioned.cpus
    totalProvisioned.memory += provisioned.memory
    totalProvisioned.storage += provisioned.storage
    totalAllocated.cpus += allocated.cpus
    totalAllocated.memory += allocated.memory
    totalAllocated.storage += allocated.storage
  })

  return { totalAllocated, totalProvisioned }
}

export type ChartDatum = {
  // we're doing the x axis as timestamp ms instead of Date primarily to make
  // type=number work
  timestamp: number
  value: number
}

/** fill in data points at start and end of range */
export function synthesizeData(
  dataInRange: Measurement[] | undefined,
  dataBeforeRange: Measurement[] | undefined,
  startTime: Date,
  endTime: Date,
  valueTransform: (n: number) => number
): ChartDatum[] | undefined {
  // wait until both requests come back to do anything
  if (!dataInRange || !dataBeforeRange) return undefined

  const result: ChartDatum[] = []

  // need to synthesize first data point if either there is no data, or the first
  // data point is after the start of the time range. the second condition
  // should virtually always be true
  if (
    dataInRange.length === 0 ||
    dataInRange[0].timestamp.getTime() > startTime.getTime()
  ) {
    const value =
      dataBeforeRange.length > 0
        ? valueTransform(dataBeforeRange.at(-1)!.datum.datum as number)
        : 0 // if there's no data before the time range, assume value is zero
    result.push({ timestamp: startTime.getTime(), value })
  }

  result.push(
    ...dataInRange.map(({ datum, timestamp }) => ({
      timestamp: timestamp.getTime(),
      // all of these metrics are cumulative ints
      value: valueTransform(datum.datum as number),
    }))
  )

  // add point for the end of the time range equal to the last value in the
  // range. no timestamp check necessary because endTime is exclusive
  result.push({
    timestamp: endTime.getTime(),
    value: result.at(-1)!.value,
  })

  return result
}

// do this by hand instead of getting elaborate in the client generator.
// see https://github.com/oxidecomputer/oxide.ts/pull/231
export function parseIpUtilization({ ipv4, ipv6 }: IpPoolUtilization) {
  return {
    ipv4,
    ipv6: {
      allocated: BigInt(ipv6.allocated),
      capacity: BigInt(ipv6.capacity),
    },
  }
}
