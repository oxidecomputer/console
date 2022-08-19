/// Helpers for working with API objects
import { pick } from '@oxide/util'

import type {
  Bindouble,
  Binint64,
  Datum,
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

export const nullIfEmpty = (s: string | null | undefined): string | null =>
  typeof s === 'string' && s.trim().length > 0 ? s : null

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

type DatumValue<D extends Datum> = D['type'] extends 'bool'
  ? boolean
  : D['type'] extends 'f64' | 'i64'
  ? number
  : D['type'] extends 'string'
  ? string
  : D['type'] extends 'bytes'
  ? number[]
  : D['type'] extends 'cumulative_f64' | 'cumulative_i64'
  ? number
  : D['type'] extends 'histogram_f64'
  ? Bindouble[]
  : D['type'] extends 'histogram_i64'
  ? Binint64[]
  : never

export function datumToValue<D extends Datum>(datum: D): DatumValue<D> {
  switch (datum.type) {
    case 'bool':
    case 'bytes':
    case 'f64':
    case 'i64':
    case 'string':
      return datum.datum as DatumValue<D>
    case 'cumulative_f64':
    case 'cumulative_i64':
      return datum.datum.value as DatumValue<D>
    // this isn't really normal data is it
    case 'histogram_f64':
    case 'histogram_i64':
      return datum.datum.bins as DatumValue<D>
  }
}
