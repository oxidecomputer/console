/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { describe, expect, test } from 'vitest'

import type { ExternalIp, IpVersion, UnicastIpPool } from '~/api'

import { getEphemeralIpSlots, parseIp, parseIpNet } from './ip'

const makePool = (ipVersion: IpVersion, name = `pool-${ipVersion}`): UnicastIpPool => ({
  id: `id-${name}`,
  name,
  description: '',
  ipVersion,
  isDefault: false,
  poolType: 'unicast',
  timeCreated: new Date(),
  timeModified: new Date(),
})

const v4Pool = makePool('v4')
const v6Pool = makePool('v6')

const v4Ephemeral: ExternalIp = { ip: '10.0.0.1', ipPoolId: 'p1', kind: 'ephemeral' }
const v6Ephemeral: ExternalIp = { ip: 'fd00::1', ipPoolId: 'p2', kind: 'ephemeral' }

describe('getEphemeralIpSlots', () => {
  test('no NICs', () => {
    expect(getEphemeralIpSlots([], [], [v4Pool, v6Pool])).toEqual({
      availableVersions: [],
      disabledReason: 'Instance has no network interfaces',
    })
  })

  test('v4-only, no attached ephemeral', () => {
    expect(getEphemeralIpSlots(['v4'], [], [v4Pool])).toEqual({
      availableVersions: ['v4'],
      disabledReason: null,
    })
  })

  test('v4-only, v4 attached', () => {
    expect(getEphemeralIpSlots(['v4'], [v4Ephemeral], [v4Pool])).toEqual({
      availableVersions: [],
      disabledReason: 'Instance already has an ephemeral IP',
    })
  })

  test('v6-only, no attached ephemeral', () => {
    expect(getEphemeralIpSlots(['v6'], [], [v6Pool])).toEqual({
      availableVersions: ['v6'],
      disabledReason: null,
    })
  })

  test('v6-only, v6 attached', () => {
    expect(getEphemeralIpSlots(['v6'], [v6Ephemeral], [v6Pool])).toEqual({
      availableVersions: [],
      disabledReason: 'Instance already has an ephemeral IP',
    })
  })

  test('dual-stack, no attached', () => {
    expect(getEphemeralIpSlots(['v4', 'v6'], [], [v4Pool, v6Pool])).toEqual({
      availableVersions: ['v4', 'v6'],
      disabledReason: null,
    })
  })

  test('dual-stack, v4 attached, v6 pools available', () => {
    expect(getEphemeralIpSlots(['v4', 'v6'], [v4Ephemeral], [v4Pool, v6Pool])).toEqual({
      availableVersions: ['v6'],
      disabledReason: null,
    })
  })

  test('dual-stack, v6 attached, v4 pools available', () => {
    expect(getEphemeralIpSlots(['v4', 'v6'], [v6Ephemeral], [v4Pool, v6Pool])).toEqual({
      availableVersions: ['v4'],
      disabledReason: null,
    })
  })

  test('dual-stack, both attached', () => {
    expect(
      getEphemeralIpSlots(['v4', 'v6'], [v4Ephemeral, v6Ephemeral], [v4Pool, v6Pool])
    ).toEqual({
      availableVersions: [],
      disabledReason: 'Instance already has ephemeral IPs for all supported address types',
    })
  })

  test('dual-stack, no attached, only v4 pools available', () => {
    expect(getEphemeralIpSlots(['v4', 'v6'], [], [v4Pool])).toEqual({
      availableVersions: ['v4'],
      disabledReason: null,
    })
  })

  test('dual-stack, no attached, only v6 pools available', () => {
    expect(getEphemeralIpSlots(['v4', 'v6'], [], [v6Pool])).toEqual({
      availableVersions: ['v6'],
      disabledReason: null,
    })
  })

  test('dual-stack, v4 attached, no v6 pools', () => {
    expect(getEphemeralIpSlots(['v4', 'v6'], [v4Ephemeral], [v4Pool])).toEqual({
      availableVersions: [],
      disabledReason: 'No V6 pools available for ephemeral IPs',
    })
  })

  test('dual-stack, v6 attached, no v4 pools', () => {
    expect(getEphemeralIpSlots(['v4', 'v6'], [v6Ephemeral], [v6Pool])).toEqual({
      availableVersions: [],
      disabledReason: 'No V4 pools available for ephemeral IPs',
    })
  })

  test('dual-stack, no attached, no pools at all', () => {
    expect(getEphemeralIpSlots(['v4', 'v6'], [], [])).toEqual({
      availableVersions: [],
      disabledReason: 'No V4/V6 pools available for ephemeral IPs',
    })
  })

  test('v4-only, no pools available', () => {
    expect(getEphemeralIpSlots(['v4'], [], [v6Pool])).toEqual({
      availableVersions: [],
      disabledReason: 'No V4 pools available for ephemeral IPs',
    })
  })

  test('v4-only, v6 attached (ignored)', () => {
    expect(getEphemeralIpSlots(['v4'], [v6Ephemeral], [v4Pool])).toEqual({
      availableVersions: ['v4'],
      disabledReason: null,
    })
  })

  test('dual-stack, invalid attached IP is ignored', () => {
    const invalidIp: ExternalIp = { ip: 'not-an-ip', ipPoolId: 'p3', kind: 'ephemeral' }
    expect(getEphemeralIpSlots(['v4', 'v6'], [invalidIp], [v4Pool, v6Pool])).toEqual({
      availableVersions: ['v4', 'v6'],
      disabledReason: null,
    })
  })
})

// Small Rust project where we validate that the built-in Ipv4Addr and Ipv6Addr
// and oxnet's Ipv4Net and Ipv6Net have the same validation behavior as our code.
// https://github.com/oxidecomputer/test-ip-validation

const v4 = ['123.4.56.7', '1.2.3.4']

test.each(v4)('parseIp catches valid IPV4 / invalid IPV6: %s', (s) => {
  expect(parseIp(s)).toStrictEqual({ type: 'v4', address: s })
})

const v6 = [
  '2001:db8:3333:4444:5555:6666:7777:8888',
  '2001:db8:3333:4444:CCCC:DDDD:EEEE:FFFF',
  '::',
  '2001:db8::',
  '::1234:5678',
  '2001:db8::1234:5678',
  '2001:0db8:85a3:0000:0000:8a2e:0370:7334',
  '::ffff:192.0.2.128',
  '1:2:3:4:5:6:7:8',
  '::ffff:10.0.0.1',
  '::ffff:1.2.3.4',
  '::ffff:0.0.0.0',
  '1:2:3:4:5:6:77:88',
  '::ffff:255.255.255.255',
  'fe08::7:8',
  'ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff',
]

test.each(v6)('parseIp catches invalid IPV4 / valid IPV6: %s', (s) => {
  expect(parseIp(s).type).toEqual('v6')
})

const invalid = [
  '',
  '1',
  'abc',
  'a.b.c.d',
  // some implementations (I think incorrectly) allow leading zeros but nexus does not
  '01.102.103.104',
  '127.0.0',
  '127.0.0.1.',
  '127.0.0.1 ',
  ' 127.0.0.1',
  '10002.3.4',
  '1.2.3.4.5',
  '256.0.0.0',
  '260.0.0.0',
  '256.1.1.1',
  '192.168.0.0.0',
  '2001:0db8:85a3:0000:0000:8a2e:0370:7334 ',
  ' 2001:db8::',
  '1:2:3:4:5:6:7:8:9',
  '1:2:3:4:5:6::7:8',
  ':1:2:3:4:5:6:7:8',
  '1:2:3:4:5:6:7:8:',
  '::1:2:3:4:5:6:7:8',
  '1:2:3:4:5:6:7:8::',
  '1:2:3:4:5:6:7:88888',
  '2001:db8:3:4:5::192.0.2.33', // std::new::Ipv6Net allows this one
  'fe08::7:8%',
  'fe08::7:8i',
  'fe08::7:8interface',
]

test.each(invalid)('parseIp catches invalid IP: %s', (s) => {
  expect(parseIp(s)).toStrictEqual({ type: 'error', message: 'Not a valid IP address' })
})

test.each([...v4.map((ip) => ip + '/10'), '1.1.1.1/04', '1.1.1.1/000004'])('%s', (s) => {
  expect(parseIpNet(s).type).toBe('v4')
})

test.each([...v6.map((ip) => ip + '/10'), '2001:db8::/128', '2001:db8::/00004'])(
  '%s',
  (s) => {
    expect(parseIpNet(s).type).toBe('v6')
  }
)

test.each(invalid.map((ip) => ip + '/10'))('parseIpNet catches invalid value: %s', (s) => {
  expect(parseIpNet(s).type).toBe('error')
})

const nonsense = 'Must contain an IP address and a width, separated by a /'
const badWidth = 'Width must be an integer'
const ipv4Width = 'Max width for IPv4 is 32'
const ipv6Width = 'Max width for IPv6 is 128'

test.each([
  ['', nonsense],
  ['abc', nonsense],
  ['/32', nonsense],
  ['1.1.1.1', nonsense],
  ['abc/2', nonsense],
  ['1.1.1.1/', nonsense],
  ['192.168.0.0.0/24', nonsense],
  ['fd::/', nonsense],
  ['1.1.1.1/a', badWidth],
  ['192.168.0.0/-1', badWidth],
  ['fd::/a', badWidth],
  ['1.1.1.1/33', ipv4Width],
  ['fd::/129', ipv6Width],
])('parseIpNet message: %s', (input, message) => {
  expect(parseIpNet(input)).toEqual({ type: 'error', message })
})
