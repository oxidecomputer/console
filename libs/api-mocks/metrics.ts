import { addSeconds } from 'date-fns'

import type { Measurement } from '@oxide/api'

import type { Json } from './json-type'

export const genI64Data = (
  values: number[],
  start: Date,
  intervalSeconds = 1
): Json<Measurement[]> =>
  values.map((v, i) => ({
    datum: {
      datum: v,
      type: 'i64',
    },
    timestamp: addSeconds(start, i * intervalSeconds).toISOString(),
  }))
