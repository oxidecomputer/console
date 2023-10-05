/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { expect, test } from 'vitest'

import { exclude, pick } from './object'

test('pick', () => {
  expect(pick({ a: 1, b: '2', c: { d: false } }, 'a', 'b')).toEqual({ a: 1, b: '2' })
})

test('exclude', () => {
  expect(exclude({ a: 1, b: '2', c: { d: false } }, 'a', 'c')).toEqual({ b: '2' })
})
