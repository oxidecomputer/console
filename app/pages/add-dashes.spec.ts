/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { expect, test } from 'vitest'

import { addDashes } from './DeviceAuthVerifyPage'

test('addDashes', () => {
  expect(addDashes([], 'abcdefgh')).toEqual('abcdefgh')
  expect(addDashes([3], 'abcdefgh')).toEqual('abcd-efgh')
  expect(addDashes([2, 5], 'abcdefgh')).toEqual('abc-def-gh')
  // too-high idxs are ignored
  expect(addDashes([7], 'abcd')).toEqual('abcd')
})
