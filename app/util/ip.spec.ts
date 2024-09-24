/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { expect, test } from 'vitest'

import { validateIp, validateIpNet } from './ip'

// Small Rust project where we validate that the built-in Ipv4Addr and Ipv6Addr
// and oxnet's Ipv4Net and Ipv6Net have the same validation behavior as our code.
// https://github.com/oxidecomputer/test-ip-validation

const v4 = ['123.4.56.7', '1.2.3.4']

test.each(v4)('validateIp catches valid IPV4 / invalid IPV6: %s', (s) => {
  expect(validateIp(s)).toStrictEqual({ isv4: true, isv6: false, valid: true })
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

test.each(v6)('validateIp catches invalid IPV4 / valid IPV6: %s', (s) => {
  expect(validateIp(s)).toStrictEqual({ isv4: false, isv6: true, valid: true })
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

test.each(invalid)('validateIp catches invalid IP: %s', (s) => {
  expect(validateIp(s)).toStrictEqual({ isv4: false, isv6: false, valid: false })
})

test.each(v4.map((ip) => ip + '/10'))('%s', (s) => {
  expect(validateIpNet(s).type).toBe('v4')
})

test.each([...v6.map((ip) => ip + '/10'), '2001:db8::/128'])('%s', (s) => {
  expect(validateIpNet(s).type).toBe('v6')
})

test.each([
  ...invalid.map((ip) => ip + '/10'),
  'abc',
  '',
  '1.1.1.1',
  '1.1.1.1/180',
  '256.0.0.0/24',
  '192.168.0.0/33',
  '192.168.0.0/-1',
  '192.168.0.0.0/24',
  '192.168.0/24',
  '2001:db8::/129',
])('validateIpNet catches invalid value: %s', (s) => {
  expect(validateIpNet(s).type).toBe('error')
})
