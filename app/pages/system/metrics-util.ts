/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { groupBy } from '@oxide/util'

export type SiloMetric = {
  siloName: string
  metrics: Record<string, number>
}

export const mergeSiloMetrics = (results: SiloMetric[]): SiloMetric[] => {
  return groupBy(results, (result) => result.siloName).map(([siloName, values]) => ({
    siloName,
    metrics: Object.assign({}, ...values.map((v) => v.metrics)),
  }))
}
