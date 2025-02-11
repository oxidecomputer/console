/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { expect, test } from 'vitest'

import { getOrderOfMagnitude, getUnit } from './OxqlMetric'

test('getOrderOfMagnitude', () => {
  expect(getOrderOfMagnitude(5, 1000)).toEqual(0)
  expect(getOrderOfMagnitude(1000, 1000)).toEqual(1)
  expect(getOrderOfMagnitude(1001, 1000)).toEqual(1)
  expect(getOrderOfMagnitude(10 ** 6, 1000)).toEqual(2)
  expect(getOrderOfMagnitude(10 ** 6 + 1, 1000)).toEqual(2)
  expect(getOrderOfMagnitude(10 ** 9, 1000)).toEqual(3)
  expect(getOrderOfMagnitude(10 ** 9 + 1, 1000)).toEqual(3)

  // Bytes
  expect(getOrderOfMagnitude(5, 1024)).toEqual(0)
  // KiBs
  expect(getOrderOfMagnitude(1024, 1024)).toEqual(1)
  expect(getOrderOfMagnitude(1025, 1024)).toEqual(1)
  expect(getOrderOfMagnitude(2 ** 20 - 1, 1024)).toEqual(1)
  // MiBs
  expect(getOrderOfMagnitude(2 ** 20, 1024)).toEqual(2)
  expect(getOrderOfMagnitude(2 ** 20 + 1, 1024)).toEqual(2)
  expect(getOrderOfMagnitude(2 ** 30 - 1, 1024)).toEqual(2)
  // GiBs
  expect(getOrderOfMagnitude(2 ** 30, 1024)).toEqual(3)
  expect(getOrderOfMagnitude(2 ** 30 + 1, 1024)).toEqual(3)
})

// test('yAxisLabelForCountChart', () => {
//   expect(yAxisLabelForCountChart(5, 0)).toEqual('5')
//   expect(yAxisLabelForCountChart(1000, 1)).toEqual('1k')
//   expect(yAxisLabelForCountChart(1001, 1)).toEqual('1k')
//   expect(yAxisLabelForCountChart(10 ** 6, 2)).toEqual('1M')
//   expect(yAxisLabelForCountChart(10 ** 6 + 1, 2)).toEqual('1M')
//   expect(yAxisLabelForCountChart(10 ** 9, 3)).toEqual('1B')
//   expect(yAxisLabelForCountChart(10 ** 9 + 1, 3)).toEqual('1B')
//   expect(yAxisLabelForCountChart(10 ** 12, 4)).toEqual('1T')
//   expect(yAxisLabelForCountChart(10 ** 12 + 1, 4)).toEqual('1T')
// })

test('getUnit', () => {
  expect(getUnit('CPU Utilization')).toEqual('%')
  expect(getUnit('Bytes Read')).toEqual('Bytes')
  expect(getUnit('Disk reads')).toEqual('Count')
})
