/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { describe, expect, it } from 'vitest'

import { createResolver } from './subnet-pool-member-add'

const resolve = createResolver('v4')
const resolve6 = createResolver('v6')

const valid = { subnet: '10.0.0.0/16', minPrefixLength: 20, maxPrefixLength: 28 }

type Result = ReturnType<typeof resolve>

function errMsg(result: Result, field: keyof Result['errors']) {
  return result.errors[field]?.message
}

describe('createResolver', () => {
  it('accepts valid v4 input', () => {
    expect(Object.keys(resolve(valid).errors)).toEqual([])
  })

  it('accepts valid v6 input', () => {
    const result = resolve6({
      subnet: 'fd00:1000::/32',
      minPrefixLength: 48,
      maxPrefixLength: 64,
    })
    expect(Object.keys(result.errors)).toEqual([])
  })

  it('accepts omitted prefix lengths', () => {
    const result = resolve({
      subnet: '10.0.0.0/16',
      minPrefixLength: NaN,
      maxPrefixLength: NaN,
    })
    expect(Object.keys(result.errors)).toEqual([])
  })

  it('rejects invalid CIDR', () => {
    const result = resolve({ ...valid, subnet: 'not-a-cidr' })
    expect(errMsg(result, 'subnet')).toMatch(/IP address/)
  })

  it('rejects v6 subnet in v4 pool', () => {
    const result = resolve({ ...valid, subnet: 'fd00::/32' })
    expect(errMsg(result, 'subnet')).toBe('IPv6 subnet not allowed in IPv4 pool')
  })

  it('rejects v4 subnet in v6 pool', () => {
    const result = resolve6({ ...valid, subnet: '10.0.0.0/16' })
    expect(errMsg(result, 'subnet')).toBe('IPv4 subnet not allowed in IPv6 pool')
  })

  it('rejects min > max prefix length', () => {
    const result = resolve({ ...valid, minPrefixLength: 28, maxPrefixLength: 20 })
    expect(errMsg(result, 'minPrefixLength')).toMatch(/≤/)
  })

  it('rejects min prefix length < subnet width', () => {
    const result = resolve({ ...valid, minPrefixLength: 8 })
    expect(errMsg(result, 'minPrefixLength')).toMatch(/≥ subnet prefix length \(16\)/)
  })

  it('rejects max prefix length < subnet width', () => {
    const result = resolve({ ...valid, maxPrefixLength: 8 })
    expect(errMsg(result, 'maxPrefixLength')).toMatch(/≥ subnet prefix length \(16\)/)
  })

  it('rejects prefix length above max bound (v4: 32)', () => {
    const result = resolve({ ...valid, minPrefixLength: 33 })
    expect(errMsg(result, 'minPrefixLength')).toBe('Must be between 0 and 32')
  })

  it('rejects prefix length below 0', () => {
    const result = resolve({ ...valid, maxPrefixLength: -1 })
    expect(errMsg(result, 'maxPrefixLength')).toBe('Must be between 0 and 32')
  })

  it('shows min-≤-max error even when min is also below subnet width', () => {
    // min(12) > max(10) AND min(12) < subnetWidth(16): the min-≤-max error
    // should take priority over the subnet-width error
    const result = resolve({ ...valid, minPrefixLength: 12, maxPrefixLength: 10 })
    expect(errMsg(result, 'minPrefixLength')).toMatch(/≤/)
  })

  it('rejects prefix length above max bound (v6: 128)', () => {
    const result = resolve6({
      subnet: 'fd00::/32',
      minPrefixLength: 48,
      maxPrefixLength: 200,
    })
    expect(errMsg(result, 'maxPrefixLength')).toBe('Must be between 0 and 128')
  })
})
