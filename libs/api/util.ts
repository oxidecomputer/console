/// Helpers for working with API objects
import { bytesToGiB, pick, sumBy } from '@oxide/util'

import type {
  DiskState,
  Sled,
  UpdateableComponentType,
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

export const componentTypeNames: Record<UpdateableComponentType, string> = {
  bootloader_for_rot: 'Bootloader for RoT',
  bootloader_for_sp: 'Bootloader for SP',
  bootloader_for_host_proc: 'Bootloader for Host Processor',
  hubris_for_psc_rot: 'Hubris for PSC RoT',
  hubris_for_psc_sp: 'Hubris for PSC SP',
  hubris_for_sidecar_rot: 'Hubris for Sidecar RoT',
  hubris_for_sidecar_sp: 'Hubris for Sidecar SP',
  hubris_for_gimlet_rot: 'Hubris for Gimlet RoT',
  hubris_for_gimlet_sp: 'Hubris for Gimlet SP',
  helios_host_phase1: 'Helios for Host Phase 1',
  helios_host_phase2: 'Helios for Host Phase 2',
  host_omicron: 'Host Omicron',
}

/** Disk states that allow delete. See [Omicron source](https://github.com/oxidecomputer/omicron/blob/4970c71e/nexus/db-queries/src/db/datastore/disk.rs#L578-L582). */
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

/** Hard coded in the API, so we can hard code it here. */
export const FLEET_ID = '001de000-1334-4000-8000-000000000000'

const TBtoTiB = 0.909
const FUDGE = 0.7

export type Capacity = {
  disk_tib: number
  ram_gib: number
  cpu: number
}

export function totalCapacity(
  sleds: Pick<Sled, 'usableHardwareThreads' | 'usablePhysicalRam'>[]
): Capacity {
  return {
    disk_tib: Math.ceil(FUDGE * 32 * TBtoTiB), // TODO: make more real
    ram_gib: Math.ceil(bytesToGiB(FUDGE * sumBy(sleds, (s) => s.usablePhysicalRam))),
    cpu: Math.ceil(FUDGE * sumBy(sleds, (s) => s.usableHardwareThreads)),
  }
}
