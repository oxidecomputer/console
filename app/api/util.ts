/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
/// Helpers for working with API objects
import { sumBy } from '~/util/array'
import { mapValues, pick } from '~/util/object'
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
  pick(
    rule,
    'name',
    'action',
    'description',
    'direction',
    'filters',
    'priority',
    'status',
    'targets'
  )

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

export const instanceCan = mapValues(
  {
    start: ['stopped'],
    reboot: ['running'],
    stop: ['running', 'starting'],
    delete: ['stopped', 'failed'],
    // https://github.com/oxidecomputer/omicron/blob/9eff6a4/nexus/db-queries/src/db/datastore/disk.rs#L310-L314
    detachDisk: ['creating', 'stopped', 'failed'],
    // https://github.com/oxidecomputer/omicron/blob/a7c7a67/nexus/db-queries/src/db/datastore/disk.rs#L183-L184
    attachDisk: ['creating', 'stopped'],
    // https://github.com/oxidecomputer/omicron/blob/8f0cbf0/nexus/db-queries/src/db/datastore/network_interface.rs#L482
    updateNic: ['stopped'],
    // https://github.com/oxidecomputer/omicron/blob/ebcc2acd/nexus/src/app/instance.rs#L1648-L1676
    serialConsole: ['running', 'rebooting', 'migrating', 'repairing'],
  },
  // cute way to make it ergonomic to call the test while also making the states
  // available directly
  (states: InstanceState[]) => {
    const test = (i: Instance) => states.includes(i.runState)
    test.states = states
    return test
  }
)

export const diskCan = mapValues(
  {
    // https://github.com/oxidecomputer/omicron/blob/4970c71e/nexus/db-queries/src/db/datastore/disk.rs#L578-L582.
    delete: ['detached', 'creating', 'faulted'],
    // TODO: link to API source
    snapshot: ['attached', 'detached'],
    // https://github.com/oxidecomputer/omicron/blob/4970c71e/nexus/db-queries/src/db/datastore/disk.rs#L169-L172
    attach: ['creating', 'detached'],
  },
  (states: DiskState['state'][]) => {
    // only have to Pick because we want this to work for both Disk and
    // Json<Disk>, which we pass to it in the MSW handlers
    const test = (d: Pick<Disk, 'state'>) => states.includes(d.state.state)
    test.states = states
    return test
  }
)

/** Hard coded in the API, so we can hard code it here. */
export const FLEET_ID = '001de000-1334-4000-8000-000000000000'

const TBtoTiB = 0.909
const FUDGE = 0.7

export function totalCapacity(
  sleds: Pick<Sled, 'usableHardwareThreads' | 'usablePhysicalRam'>[]
) {
  return {
    disk_tib: Math.ceil(FUDGE * sleds.length * 32 * TBtoTiB), // TODO: make more real
    ram_gib: Math.ceil(bytesToGiB(FUDGE * sumBy(sleds, (s) => s.usablePhysicalRam))),
    cpu: Math.ceil(FUDGE * sumBy(sleds, (s) => s.usableHardwareThreads)),
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
