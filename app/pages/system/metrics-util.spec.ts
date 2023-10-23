/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { describe, expect, it } from 'vitest'

import type { SystemMetricName } from '@oxide/api'

import type { MetricsResult } from './metrics-util'
import { tabularizeSiloMetrics } from './metrics-util'

function makeResult(
  silo: string,
  metricName: SystemMetricName,
  value: number
): MetricsResult {
  return {
    data: {
      items: [
        {
          datum: { type: 'i64', datum: value },
          timestamp: new Date(),
        },
      ],
      params: { query: { silo }, path: { metricName } },
    },
  }
}

describe('tabularizeSiloMetrics', () => {
  it('handles zero silos', () => {
    expect(tabularizeSiloMetrics([])).toEqual([])
  })
  it('handles multiple silos', () => {
    expect(
      tabularizeSiloMetrics([
        makeResult('a', 'virtual_disk_space_provisioned', 1),
        makeResult('b', 'virtual_disk_space_provisioned', 2),
        makeResult('a', 'cpus_provisioned', 3),
        makeResult('b', 'cpus_provisioned', 4),
        makeResult('a', 'ram_provisioned', 5),
        makeResult('b', 'ram_provisioned', 6),
        // here to make sure it gets ignored and doesn't break anything
        // @ts-expect-error
        { error: 'whoops' },
      ])
    ).toEqual([
      {
        siloName: 'a',
        metrics: {
          virtual_disk_space_provisioned: 1,
          cpus_provisioned: 3,
          ram_provisioned: 5,
        },
      },
      {
        siloName: 'b',
        metrics: {
          virtual_disk_space_provisioned: 2,
          cpus_provisioned: 4,
          ram_provisioned: 6,
        },
      },
    ])
  })

  it('handles silo with empty metrics response', () => {
    expect(
      tabularizeSiloMetrics([
        {
          data: {
            items: [],
            params: {
              query: { silo: 'whatever' },
              path: { metricName: 'ram_provisioned' },
            },
          },
        },
      ])
    ).toEqual([
      {
        metrics: { ram_provisioned: 0 },
        siloName: 'whatever',
      },
    ])
  })
})
