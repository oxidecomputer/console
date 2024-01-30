/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { expect, test } from 'vitest'

import { getCycleCount } from './MetricsTab'

test('getCycleCount', () => {
  expect(getCycleCount(5, 1000)).toEqual(0)
  expect(getCycleCount(1000, 1000)).toEqual(0)
  expect(getCycleCount(1001, 1000)).toEqual(1)
  expect(getCycleCount(10 ** 6, 1000)).toEqual(1)
  expect(getCycleCount(10 ** 6 + 1, 1000)).toEqual(2)
  expect(getCycleCount(10 ** 9, 1000)).toEqual(2)
  expect(getCycleCount(10 ** 9 + 1, 1000)).toEqual(3)

  expect(getCycleCount(5, 1024)).toEqual(0)
  expect(getCycleCount(1024, 1024)).toEqual(0)
  expect(getCycleCount(1025, 1024)).toEqual(1)
  expect(getCycleCount(2 ** 20, 1024)).toEqual(1)
  expect(getCycleCount(2 ** 20 + 1, 1024)).toEqual(2)
  expect(getCycleCount(2 ** 30, 1024)).toEqual(2)
  expect(getCycleCount(2 ** 30 + 1, 1024)).toEqual(3)
})
