/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

// Borrowed from Valibot. I tried some from Zod and an O'Reilly regex cookbook
// but they didn't match results with std::net on simple test cases
// https://github.com/fabian-hiller/valibot/blob/2554aea5/library/src/regex.ts#L43-L54

const IPV4_REGEX =
  /^(?:(?:[1-9]|1\d|2[0-4])?\d|25[0-5])(?:\.(?:(?:[1-9]|1\d|2[0-4])?\d|25[0-5])){3}$/u

const IPV6_REGEX =
  /^(?:(?:[\da-f]{1,4}:){7}[\da-f]{1,4}|(?:[\da-f]{1,4}:){1,7}:|(?:[\da-f]{1,4}:){1,6}:[\da-f]{1,4}|(?:[\da-f]{1,4}:){1,5}(?::[\da-f]{1,4}){1,2}|(?:[\da-f]{1,4}:){1,4}(?::[\da-f]{1,4}){1,3}|(?:[\da-f]{1,4}:){1,3}(?::[\da-f]{1,4}){1,4}|(?:[\da-f]{1,4}:){1,2}(?::[\da-f]{1,4}){1,5}|[\da-f]{1,4}:(?::[\da-f]{1,4}){1,6}|:(?:(?::[\da-f]{1,4}){1,7}|:)|fe80:(?::[\da-f]{0,4}){0,4}%[\da-z]+|::(?:f{4}(?::0{1,4})?:)?(?:(?:25[0-5]|(?:2[0-4]|1?\d)?\d)\.){3}(?:25[0-5]|(?:2[0-4]|1?\d)?\d)|(?:[\da-f]{1,4}:){1,4}:(?:(?:25[0-5]|(?:2[0-4]|1?\d)?\d)\.){3}(?:25[0-5]|(?:2[0-4]|1?\d)?\d))$/iu

export function validateIp(ip: string) {
  const isv4 = IPV4_REGEX.test(ip)
  const isv6 = !isv4 && IPV6_REGEX.test(ip)
  return { isv4, isv6, valid: isv4 || isv6 }
}

// Following oxnet:
// https://github.com/oxidecomputer/oxnet/blob/7dacd265f1bcd0f8b47bd4805250c4f0812da206/src/ipnet.rs#L373-L385
// https://github.com/oxidecomputer/oxnet/blob/7dacd265f1bcd0f8b47bd4805250c4f0812da206/src/ipnet.rs#L217-L223

// TODO: change this terrible result type to include more info, including a message
const invalidResult = { isv4: false, isv6: false, valid: false }

export function validateIpNet(ipNet: string) {
  // don't trim -- the form field should disallow whitespace
  const splits = ipNet.split('/')
  if (splits.length !== 2) {
    return { isv4: false, isv6: false, valid: false }
  }

  const [addrStr, widthStr] = splits

  const { isv4, isv6, valid } = validateIp(addrStr)

  if (!/^\d+$/.test(widthStr)) {
    // TODO: return message about bad width
    return { isv4: false, isv6: false, valid: false }
  }
  const width = parseInt(widthStr, 10)

  // validate width is a number and for IPv4 is under <= 32
  // https://github.com/oxidecomputer/oxnet/blob/7dacd265f1bcd0f8b47bd4805250c4f0812da206/src/ipnet.rs#L206
  // and for IPv6 is <= 128
  // https://github.com/oxidecomputer/oxnet/blob/7dacd265f1bcd0f8b47bd4805250c4f0812da206/src/ipnet.rs#L443
  // TODO: return message about bad width
  if (isv4 && width > 32) return invalidResult
  if (isv6 && width > 128) return invalidResult

  return { isv4, isv6, valid }
}
