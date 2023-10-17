/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { expect, test } from 'vitest'

import { mergeSiloMetrics } from './metrics-util'

test('mergeSiloMetrics', () => {
  expect(mergeSiloMetrics([])).toEqual([])
  expect(mergeSiloMetrics([{ siloName: 'a', metrics: { m1: 1 } }])).toEqual([
    { siloName: 'a', metrics: { m1: 1 } },
  ])
  expect(
    mergeSiloMetrics([
      { siloName: 'a', metrics: { m1: 1 } },
      { siloName: 'a', metrics: { m2: 2 } },
    ])
  ).toEqual([{ siloName: 'a', metrics: { m1: 1, m2: 2 } }])
  expect(
    mergeSiloMetrics([
      { siloName: 'a', metrics: { m1: 1 } },
      { siloName: 'a', metrics: { m2: 2 } },
      { siloName: 'b', metrics: { m1: 3 } },
    ])
  ).toEqual([
    { siloName: 'a', metrics: { m1: 1, m2: 2 } },
    { siloName: 'b', metrics: { m1: 3 } },
  ])
})
