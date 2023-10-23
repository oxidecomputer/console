/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import type {
  MeasurementResultsPage,
  SystemMetricName,
  SystemMetricPathParams,
  SystemMetricQueryParams,
} from '@oxide/api'
import { groupBy } from '@oxide/util'

export type MetricsResult = {
  data?: MeasurementResultsPage & {
    params: {
      path: SystemMetricPathParams
      query?: SystemMetricQueryParams
    }
  }
}

type SiloMetric = {
  siloName: string
  metrics: Record<SystemMetricName, number>
}

/**
 * Turn the big list of query results into something we can display in a table.
 * See the tests for an example.
 */
export function tabularizeSiloMetrics(results: MetricsResult[]): SiloMetric[] {
  const processed = results
    // filter mostly to ensure we don't try to pull data off an error response
    .filter((r) => r.data?.params.query?.silo)
    .map((r) => {
      const metricName = r.data!.params.path.metricName
      const value = (r.data!.items[0]?.datum.datum || 0) as number
      return {
        siloName: r.data!.params.query!.silo!,
        metrics: { [metricName]: value },
      }
    })

  return groupBy(processed, (r) => r.siloName).map(([siloName, results]) => {
    return { siloName, metrics: Object.assign({}, ...results.map((r) => r.metrics)) }
  })
}
