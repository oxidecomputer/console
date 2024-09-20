/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

// Here we add some handy stuff to window for use from the browser JS console.
// requests will use the session cookie, same as normal API calls

import { ALL_ISH } from '~/util/consts'

import { type ApiResult } from './__generated__/http-client'
import { api } from './client'

function zip<T, U>(arr1: T[], arr2: U[]): [T, U][] {
  const length = Math.min(arr1.length, arr2.length)
  const result: [T, U][] = []

  for (let i = 0; i < length; i++) {
    result.push([arr1[i], arr2[i]])
  }

  return result
}

function handleResult<T>(result: ApiResult<T>): T {
  if (result.type !== 'success') {
    if (result.type === 'error') console.error(result.data.message)
    throw result
  }
  return result.data
}

function logHeading(s: string) {
  console.log(`%c${s}`, 'font-size: 16px; font-weight: bold;')
}

if (typeof window !== 'undefined') {
  // @ts-expect-error
  window.oxide = api.methods
  // @ts-expect-error
  window.oxql = {
    query: async (q: string) => {
      const result = await api.methods.timeseriesQuery({ body: { query: q } })
      const data = handleResult(result).tables
      logHeading(data.length + ' timeseries returned')
      for (const table of data) {
        for (const ts of Object.values(table.timeseries)) {
          const fields = Object.entries(ts.fields)
            .map(([k, v]) => `${k}: ${v.value}`)
            .join(', ')
          logHeading(`Data for { ${fields} }`)
          console.table(
            zip(ts.points.timestamps, ts.points.values[0].values.values as number[])
          )
        }
      }
      return data
    },
    schemas: async (search?: string) => {
      const result = await api.methods.timeseriesSchemaList({
        query: { limit: ALL_ISH },
      })
      const data = handleResult(result)

      let filtered = data.items
      if (search) {
        filtered = filtered.filter((s) => s.timeseriesName.includes(search))
      }
      // note we both print as table _and_ return in case the caller wants the data
      console.table(filtered)
      return filtered
    },
  }
}
