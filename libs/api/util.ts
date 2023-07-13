/// Helpers for working with API objects
import { bytesToGiB, pick, sumBy } from '@oxide/util'

import type {
  DiskState,
  Instance,
  InstanceState,
  Measurement,
  Sled,
  VpcFirewallRule,
  VpcFirewallRuleUpdate,
} from './__generated__/Api'

type PortRange = [number, number]

/** Parse '1234' into [1234, 1234] and '80-100' into [80, 100] */
// TODO: parsing should probably throw errors rather than returning
// null so we can annotate the failure with a reason
export function parsePortRange(portRange: string): PortRange | null {
  // TODO: pull pattern from openapi spec (requires generator work)
  const match = /^([0-9]{1,5})((?:-)[0-9]{1,5})?$/.exec(portRange)
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

/**
 * See https://github.com/oxidecomputer/omicron/blob/a7c7a6768/nexus/db-queries/src/db/datastore/disk.rs#L183-L184
 */
export const INSTANCE_ATTACH_DISK_STATES: Set<InstanceState> = new Set([
  'creating',
  'stopped',
])

/**
 * See https://github.com/oxidecomputer/omicron/blob/9eff6a45/nexus/db-queries/src/db/datastore/disk.rs#L310-L314
 */
export const INSTANCE_DETACH_DISK_STATES: Set<InstanceState> = new Set([
  'creating',
  'stopped',
  'failed',
])

/**
 * See https://github.com/oxidecomputer/omicron/blob/4970c71e/nexus/db-queries/src/db/datastore/disk.rs#L578-L582.
 */
export const DISK_DELETE_STATES: Set<DiskState['state']> = new Set([
  'detached',
  'creating',
  'faulted',
])

/** Disk states that allow snapshotting. TODO: link to Omicron source */
export const DISK_SNAPSHOT_STATES: Set<DiskState['state']> = new Set([
  'attached',
  'detached',
])

export const INSTANCE_STOP_STATES: Set<InstanceState> = new Set(['running', 'starting'])
export const INSTANCE_DELETE_STATES: Set<InstanceState> = new Set(['stopped', 'failed'])

export const instanceCan: Record<string, (i: Instance) => boolean> = {
  start: (i) => i.runState === 'stopped',
  reboot: (i) => i.runState === 'running',
  stop: (i) => INSTANCE_STOP_STATES.has(i.runState),
  delete: (i) => INSTANCE_DELETE_STATES.has(i.runState),
  detachDisk: (i) => INSTANCE_DETACH_DISK_STATES.has(i.runState),
  attachDisk: (i) => INSTANCE_ATTACH_DISK_STATES.has(i.runState),
}

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
