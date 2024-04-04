/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

// Here we add some handy stuff to window for use from the browser JS console.
// requests will use the session cookie, same as normal API calls

import { type ApiResult } from './__generated__/http-client'
import { api } from './client'

function handleResult<T>(result: ApiResult<T>): T {
  if (result.type !== 'success') {
    if (result.type === 'error') console.error(result.data.message)
    throw result
  }
  return result.data
}

if (typeof window !== 'undefined') {
  // @ts-expect-error
  window.oxide = api.methods
  // @ts-expect-error
  window.oxql = {
    query: async (q: string) => {
      const result = await api.methods.timeseriesQuery({ body: { query: q } })
      return handleResult(result)
    },
    schemas: async (search?: string) => {
      const result = await api.methods.timeseriesSchemaList({ query: { limit: 1000 } })
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
