/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { expect, test } from 'vitest'

import { isAllZeros } from './image-upload'

function numberToUint8Array(num: number) {
  const bytes = []
  while (num > 0) {
    bytes.unshift(num & 0xff)
    // eslint-disable-next-line no-param-reassign
    num >>= 4
  }
  return new Uint8Array(bytes)
}

test('isAllZeros', () => {
  expect(isAllZeros('AAAA')).toBeTruthy()
  expect(Array.from(Buffer.from('AAAA', 'base64'))).toEqual([0, 0, 0])

  expect(isAllZeros('AAAB')).toBeFalsy()
  expect(Array.from(Buffer.from('AAAB', 'base64'))).toEqual([0, 0, 1])

  const allZeros = Buffer.alloc(20).toString('base64')
  expect(isAllZeros(allZeros)).toBeTruthy()

  const notAllZeros = Buffer.alloc(20, 1).toString('base64')
  expect(isAllZeros(notAllZeros)).toBeFalsy()

  for (let i = 1; i < 100000; i++) {
    const s = Buffer.from(numberToUint8Array(i)).toString('base64')
    expect(isAllZeros(s)).toBeFalsy()
  }
})
