/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { addSeconds, differenceInSeconds } from 'date-fns'

import type { Measurement } from '@oxide/api'

import type { Json } from './json-type'

/** evenly distribute the `values` across the time interval */
export const genCumulativeI64Data = (
  values: number[],
  startTime: Date,
  endTime: Date
): Json<Measurement[]> => {
  const intervalSeconds = differenceInSeconds(endTime, startTime) / values.length
  return values.map((value, i) => ({
    datum: {
      datum: {
        value,
        start_time: startTime.toISOString(),
      },
      type: 'cumulative_i64',
    },
    timestamp: addSeconds(startTime, i * intervalSeconds).toISOString(),
  }))
}

export const genI64Data = (
  values: number[],
  startTime: Date,
  endTime: Date
): Json<Measurement[]> => {
  const intervalSeconds = differenceInSeconds(endTime, startTime) / values.length
  return values.map((value, i) => ({
    datum: {
      datum: value,
      type: 'i64',
    },
    timestamp: addSeconds(startTime, i * intervalSeconds).toISOString(),
  }))
}
