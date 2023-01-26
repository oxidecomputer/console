/// Helpers for working with API objects
import { groupBy, partitionBy, pick } from '@oxide/util'

import type {
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

// In rather unscientific testing, optimized version showed 20-50x speedup, with
// times around 1ms for 1200 nodes and two levels of nesting.

// export function listToTreeSlow<T extends { id: string; parentId?: string }>(
//   items: T[],
//   parentId?: string | undefined
// ): Node<T>[] {
//   return items
//     .filter((i) => i.parentId === parentId)
//     .map((o) => ({ ...o, children: listToTreeSlow(items, o.id) }))
// }

type Item = { id: string; parentId?: string }
type Node<T> = T & { children: Node<T>[] }

export function listToTree<T extends Item>(items: T[]): Node<T>[] {
  const [rest, roots] = partitionBy(items, (i) => !!i.parentId)

  const parentIdToChildren = Object.fromEntries(groupBy(rest, (i) => i.parentId!))

  function addChildren(parent: T): Node<T> {
    const children = parentIdToChildren[parent.id] || []
    return { ...parent, children: children.map(addChildren) }
  }

  return roots.map(addChildren)
}

export const componentTypeNames: Record<
  UpdateableComponentType | UpdateableComponentParent,
  string
> = {
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

  gimlet_rot: 'Gimlet RoT',
  gimlet_host: 'Gimlet Host',
  gimlet_sp: 'Gimlet SP',
  gimlet: 'Gimlet',
  sidecar_rot: 'Sidecar RoT',
  sidecar_sp: 'Sidecar SP',
  sidecar: 'Sidecar',
  psc_rot: 'PSC RoT',
  psc_sp: 'PSC SP',
  psc: 'PSC',
}

type UpdateableComponentParent =
  | 'gimlet_rot'
  | 'gimlet_host'
  | 'gimlet_sp'
  | 'gimlet'
  | 'sidecar_rot'
  | 'sidecar_sp'
  | 'sidecar'
  | 'psc_rot'
  | 'psc_sp'
  | 'psc'

export const componentTypeParents: Record<
  UpdateableComponentType | UpdateableComponentParent,
  UpdateableComponentParent | 'rack'
> = {
  // TODO: get correct answers for these
  bootloader_for_rot: 'rack',
  bootloader_for_sp: 'rack',
  bootloader_for_host_proc: 'rack',

  gimlet: 'rack',

  gimlet_rot: 'gimlet',
  hubris_for_gimlet_rot: 'gimlet_rot',

  gimlet_sp: 'gimlet',
  hubris_for_gimlet_sp: 'gimlet_sp',

  gimlet_host: 'gimlet',
  helios_host_phase1: 'gimlet_host',
  helios_host_phase2: 'gimlet_host',
  host_omicron: 'gimlet_host',

  sidecar: 'rack',
  sidecar_rot: 'sidecar',
  hubris_for_sidecar_rot: 'sidecar_rot',
  sidecar_sp: 'sidecar',
  hubris_for_sidecar_sp: 'sidecar_sp',

  psc: 'rack',
  psc_rot: 'psc',
  hubris_for_psc_rot: 'psc_rot',
  hubris_for_psc_sp: 'psc_sp',
  psc_sp: 'psc',
}
