import { addSeconds } from 'date-fns'

import type { Measurement } from '@oxide/api'

import type { Json } from './json-type'

export const genCumulativeI64Data = (
  values: number[],
  start: Date,
  intervalSeconds = 1
): Json<Measurement[]> =>
  values.map((value, i) => ({
    datum: {
      datum: {
        value,
        start_time: start.toISOString(),
      },
      type: 'cumulative_i64',
    },
    timestamp: addSeconds(start, i * intervalSeconds).toISOString(),
  }))
