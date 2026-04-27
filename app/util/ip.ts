/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import type { ExternalIp, InstanceNetworkInterface, IpVersion, UnicastIpPool } from '~/api'
import { setDiff, setIntersection } from '~/util/array'

// Borrowed from Valibot. I tried some from Zod and an O'Reilly regex cookbook
// but they didn't match results with std::net on simple test cases
// https://github.com/fabian-hiller/valibot/blob/2554aea5/library/src/regex.ts#L43-L54

const IPV4_REGEX =
  /^(?:(?:[1-9]|1\d|2[0-4])?\d|25[0-5])(?:\.(?:(?:[1-9]|1\d|2[0-4])?\d|25[0-5])){3}$/u

const IPV6_REGEX =
  /^(?:(?:[\da-f]{1,4}:){7}[\da-f]{1,4}|(?:[\da-f]{1,4}:){1,7}:|(?:[\da-f]{1,4}:){1,6}:[\da-f]{1,4}|(?:[\da-f]{1,4}:){1,5}(?::[\da-f]{1,4}){1,2}|(?:[\da-f]{1,4}:){1,4}(?::[\da-f]{1,4}){1,3}|(?:[\da-f]{1,4}:){1,3}(?::[\da-f]{1,4}){1,4}|(?:[\da-f]{1,4}:){1,2}(?::[\da-f]{1,4}){1,5}|[\da-f]{1,4}:(?::[\da-f]{1,4}){1,6}|:(?:(?::[\da-f]{1,4}){1,7}|:)|fe80:(?::[\da-f]{0,4}){0,4}%[\da-z]+|::(?:f{4}(?::0{1,4})?:)?(?:(?:25[0-5]|(?:2[0-4]|1?\d)?\d)\.){3}(?:25[0-5]|(?:2[0-4]|1?\d)?\d)|(?:[\da-f]{1,4}:){1,4}:(?:(?:25[0-5]|(?:2[0-4]|1?\d)?\d)\.){3}(?:25[0-5]|(?:2[0-4]|1?\d)?\d))$/iu

type ParsedIp = { type: IpVersion; address: string } | { type: 'error'; message: string }

export function parseIp(ip: string): ParsedIp {
  if (IPV4_REGEX.test(ip)) return { type: 'v4', address: ip }
  if (IPV6_REGEX.test(ip)) return { type: 'v6', address: ip }
  return { type: 'error', message: 'Not a valid IP address' }
}

/**
 * Convenience helper that can be plugged into RHF simply as
 * `validate={validateIp}`
 */
export function validateIp(ip: string): string | undefined {
  const result = parseIp(ip)
  if (result.type === 'error') return result.message
}

// Following oxnet:
// https://github.com/oxidecomputer/oxnet/blob/7dacd265f1bcd0f8b47bd4805250c4f0812da206/src/ipnet.rs#L373-L385
// https://github.com/oxidecomputer/oxnet/blob/7dacd265f1bcd0f8b47bd4805250c4f0812da206/src/ipnet.rs#L217-L223

type ParsedIpNet =
  | { type: IpVersion; address: string; width: number }
  | { type: 'error'; message: string }

const nonsenseError = {
  type: 'error' as const,
  message: 'Must contain an IP address and a width, separated by a /',
}

export function parseIpNet(ipNet: string): ParsedIpNet {
  const splits = ipNet.split('/')
  if (splits.length !== 2) return nonsenseError

  const [addrStr, widthStr] = splits

  const { type: ipType } = parseIp(addrStr)

  if (ipType === 'error') return nonsenseError
  if (widthStr.trim().length === 0) return nonsenseError

  if (!/^\d+$/.test(widthStr)) {
    return { type: 'error', message: 'Width must be an integer' }
  }
  const width = parseInt(widthStr, 10)

  if (ipType === 'v4' && width > 32) {
    return { type: 'error', message: 'Max width for IPv4 is 32' }
  }
  if (ipType === 'v6' && width > 128) {
    return { type: 'error', message: 'Max width for IPv6 is 128' }
  }

  return {
    type: ipType,
    address: addrStr,
    width: width,
  }
}

/**
 * Convenience helper that can be plugged into RHF simply as
 * `validate={validateIpNet}`
 */
export function validateIpNet(ipNet: string): string | undefined {
  const result = parseIpNet(ipNet)
  if (result.type === 'error') return result.message
}

/**
 * Get compatible IP versions from an instance's NICs. External IPs route
 * through the primary interface, so only its IP stack matters.
 */
export function getCompatibleVersionsFromNics(
  nics: InstanceNetworkInterface[]
): Set<IpVersion> {
  const primaryNic = nics.find((nic) => nic.primary)
  if (!primaryNic) return new Set()

  const { ipStack } = primaryNic
  if (ipStack.type === 'v4' || ipStack.type === 'v6') {
    return new Set([ipStack.type])
  }
  if (ipStack.type === 'dual_stack') {
    return new Set(['v4', 'v6'])
  }
  return new Set()
}

/**
 * Curried predicate that checks if an item's IP address matches one of the
 * given IP versions. Use with Array.filter to filter floating IPs, etc.
 */
export const ipHasVersion = (versions: Iterable<IpVersion>) => {
  const versionSet = new Set(versions)

  return (item: { ip: string }): boolean => {
    if (versionSet.size === 0) return false
    const ipVersion = parseIp(item.ip)
    return ipVersion.type !== 'error' && versionSet.has(ipVersion.type)
  }
}

export type EphemeralIpSlots = {
  availableVersions: IpVersion[]
  disabledReason: string | null
  infoMessage: string | null
}

/**
 * Determine which ephemeral IP versions can still be attached and whether the
 * attach button should be disabled. The API allows one ephemeral IP per IP
 * version supported by the primary NIC (e.g., a dual-stack instance can have
 * both a v4 and a v6 ephemeral IP).
 */
export function getEphemeralIpSlots(
  compatibleVersions: ReadonlySet<IpVersion>,
  attachedEphemeralIps: ExternalIp[],
  unicastPools: UnicastIpPool[]
): EphemeralIpSlots {
  if (compatibleVersions.size === 0) {
    return {
      availableVersions: [],
      disabledReason: 'Instance has no network interfaces',
      infoMessage: null,
    }
  }

  const attachedVersions = new Set<IpVersion>()
  for (const eip of attachedEphemeralIps) {
    const parsed = parseIp(eip.ip)
    if (parsed.type !== 'error') attachedVersions.add(parsed.type)
  }

  const openVersions = setDiff(compatibleVersions, attachedVersions)

  if (openVersions.size === 0) {
    const msg =
      compatibleVersions.size === 1
        ? 'Instance already has an ephemeral IP'
        : 'Instance already has v4 and v6 ephemeral IPs'
    return { availableVersions: [], disabledReason: msg, infoMessage: null }
  }

  // can only allocate a version if there's a pool for it
  const poolVersions = new Set(unicastPools.map((pool) => pool.ipVersion))
  const availableVersions = setIntersection(openVersions, poolVersions)

  if (availableVersions.size === 0) {
    const versionLabel = [...openVersions].join(' or ')
    return {
      availableVersions: [],
      disabledReason: `No ${versionLabel} pools available for ephemeral IPs`,
      infoMessage: null,
    }
  }

  let infoMessage: string | null = null
  if (availableVersions.size === 2) {
    infoMessage = 'Dual-stack network interfaces support one ephemeral IP per version.'
  } else if (availableVersions.size === 1) {
    const [version] = availableVersions
    // availableVersions has exactly one item in this branch.
    const otherVersion = version === 'v4' ? 'v6' : 'v4'

    if (!compatibleVersions.has(otherVersion)) {
      infoMessage = `Only ${version} pools are shown because the primary network interface is IP${version}-only.`
    } else if (attachedVersions.has(otherVersion)) {
      infoMessage = `Only ${version} pools are shown because this instance already has a ${otherVersion} ephemeral IP.`
    } else if (!poolVersions.has(otherVersion)) {
      infoMessage = `Only ${version} pools are shown because no ${otherVersion} pools are available.`
    }
  }

  return { availableVersions: [...availableVersions], disabledReason: null, infoMessage }
}

export const getDefaultIps = (pools: UnicastIpPool[]) => {
  const defaultPools = pools.filter((pool) => pool.isDefault)
  const v4Default = defaultPools.find((p) => p.ipVersion === 'v4')
  const hasV4Default = !!v4Default
  const v6Default = defaultPools.find((p) => p.ipVersion === 'v6')
  const hasV6Default = !!v6Default
  return {
    hasV4Default,
    hasV6Default,
    hasDualDefaults: hasV4Default && hasV6Default,
  }
}
