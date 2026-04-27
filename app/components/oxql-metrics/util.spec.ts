/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { describe, expect, test } from 'vitest'

import type { OxqlQueryResult } from '~/api'

import {
  composeOxqlData,
  getLargestValue,
  getMaxExponent,
  getMeanWithinSeconds,
  getTimePropsForOxqlQuery,
  getUtilizationChartProps,
  oxqlTimestamp,
  sumValues,
  yAxisLabelForCountChart,
} from './util'

test('oxqlTimestamp', () => {
  const date1 = new Date('2025-02-11T00:00:01.234Z')
  expect(oxqlTimestamp(date1)).toEqual('2025-02-11T00:00:01.000')
  const datePST = new Date('2025-02-11T00:00:00-08:00')
  expect(oxqlTimestamp(datePST)).toEqual('2025-02-11T08:00:00.000')
})

describe('getMeanWithinSeconds', () => {
  const start = new Date('2025-02-11T00:00:00Z')
  test('calculates the mean window for a 10-minute range', () => {
    const end = new Date('2025-02-11T00:10:00Z') // 10 minutes later
    expect(getMeanWithinSeconds(start, end)).toBe(10)
  })

  test('calculates the mean window for a 1-hour range', () => {
    const end = new Date('2025-02-11T01:00:00Z') // 60 minutes later
    expect(getMeanWithinSeconds(start, end)).toBe(60)
  })

  test('calculates the mean window for a 24-hour range', () => {
    const end = new Date('2025-02-12T00:00:00Z') // 24 hours later
    expect(getMeanWithinSeconds(start, end)).toBe(1440)
  })

  test('calculates the mean window for a 1-week range', () => {
    const end = new Date('2025-02-18T00:00:00Z') // 1 week later
    expect(getMeanWithinSeconds(start, end)).toBe(10080)
  })

  test('calculates the mean window for a 10-minute range, but with only 5 datapoints', () => {
    const end = new Date('2025-02-11T00:10:00Z') // 10 minutes later
    const datapoints = 5
    expect(getMeanWithinSeconds(start, end, datapoints)).toBe(120)
  })
  test('calculates the mean window for a 2-hour range, but with only 5 datapoints', () => {
    const end = new Date('2025-02-11T02:00:00Z') // 120 minutes later
    const datapoints = 5
    expect(getMeanWithinSeconds(start, end, datapoints)).toBe(1440)
  })
  test('calculates the mean window for a 1-month range', () => {
    const end = new Date('2025-03-11T00:00:00Z') // 28 days later
    expect(getMeanWithinSeconds(start, end)).toBe(40320)
  })
  test('calculates the mean window for a 1-month range, with only 20 datapoints', () => {
    const end = new Date('2025-03-11T00:00:00Z') // 28 days later
    expect(getMeanWithinSeconds(start, end, 20)).toBe(120960)
  })
})

test('getTimePropsForOxqlQuery', () => {
  const startTime = new Date('2025-02-21T01:00:00Z')
  const endTime = new Date('2025-02-21T02:00:00Z')
  const { meanWithinSeconds, adjustedStart } = getTimePropsForOxqlQuery(startTime, endTime)
  expect(meanWithinSeconds).toEqual(60)
  expect(adjustedStart).toEqual(new Date('2025-02-21T00:58:00.000Z'))
})

test('getMaxExponent', () => {
  expect(getMaxExponent(5, 1000)).toEqual(0)
  expect(getMaxExponent(1000, 1000)).toEqual(1)
  expect(getMaxExponent(1001, 1000)).toEqual(1)
  expect(getMaxExponent(10 ** 6, 1000)).toEqual(2)
  expect(getMaxExponent(10 ** 6 + 1, 1000)).toEqual(2)
  expect(getMaxExponent(10 ** 9, 1000)).toEqual(3)
  expect(getMaxExponent(10 ** 9 + 1, 1000)).toEqual(3)

  // Bytes
  expect(getMaxExponent(5, 1024)).toEqual(0)
  // KiBs
  expect(getMaxExponent(1024, 1024)).toEqual(1)
  expect(getMaxExponent(1025, 1024)).toEqual(1)
  expect(getMaxExponent(2 ** 20 - 1, 1024)).toEqual(1)
  // MiBs
  expect(getMaxExponent(2 ** 20, 1024)).toEqual(2)
  expect(getMaxExponent(2 ** 20 + 1, 1024)).toEqual(2)
  expect(getMaxExponent(2 ** 30 - 1, 1024)).toEqual(2)
  // GiBs
  expect(getMaxExponent(2 ** 30, 1024)).toEqual(3)
  expect(getMaxExponent(2 ** 30 + 1, 1024)).toEqual(3)

  expect(getMaxExponent(0, 1000)).toEqual(0)
})

test('yAxisLabelForCountChart', () => {
  expect(yAxisLabelForCountChart(5, 0)).toEqual('5')
  expect(yAxisLabelForCountChart(1000, 1)).toEqual('1k')
  expect(yAxisLabelForCountChart(1001, 1)).toEqual('1k')
  expect(yAxisLabelForCountChart(10 ** 6, 2)).toEqual('1M')
  expect(yAxisLabelForCountChart(10 ** 6 + 1, 2)).toEqual('1M')
  expect(yAxisLabelForCountChart(10 ** 9, 3)).toEqual('1B')
  expect(yAxisLabelForCountChart(10 ** 9 + 1, 3)).toEqual('1B')
  expect(yAxisLabelForCountChart(10 ** 12, 4)).toEqual('1T')
  expect(yAxisLabelForCountChart(10 ** 12 + 1, 4)).toEqual('1T')
})

test('getLargestValue', () => {
  const sampleData = [
    { timestamp: 1739232000000, value: 5 },
    { timestamp: 1739232060000, value: 10 },
    { timestamp: 1739232120000, value: 15 },
  ]
  expect(getLargestValue(sampleData)).toEqual(15)
  expect(getLargestValue([])).toEqual(0)
})

// Just including four datapoints for this test
const utilizationQueryResult1: OxqlQueryResult = {
  tables: [
    {
      name: 'virtual_machine:vcpu_usage',
      timeseries: [
        {
          fields: {
            vcpuId: {
              type: 'u32',
              value: 0,
            },
          },
          points: {
            timestamps: [
              new Date('2025-02-21T19:28:43Z'),
              new Date('2025-02-21T19:29:43Z'),
              new Date('2025-02-21T19:30:43Z'),
              new Date('2025-02-21T19:31:43Z'),
            ],
            values: [
              {
                values: {
                  type: 'double',
                  values: [4991154550.953981, 5002306111.529594, 5005747970.58788, null],
                },
                metricType: 'gauge',
              },
            ],
          },
        },
      ],
    },
  ],
}

const timeseries1 = utilizationQueryResult1.tables[0].timeseries[0]

test('sumValues', () => {
  expect(sumValues([], 0)).toEqual([])
  expect(sumValues([timeseries1], 4)).toEqual([
    4991154550.953981,
    5002306111.529594,
    5005747970.58788,
    null,
  ])
  // we're just including this dataset twice to show that the numbers are getting added together
  expect(sumValues([timeseries1, timeseries1], 4)).toEqual([
    9982309101.907963,
    10004612223.059189,
    10011495941.17576,
    null,
  ])
  // and for good measure, we'll include it three times
  expect(sumValues([timeseries1, timeseries1, timeseries1], 4)).toEqual([
    14973463652.861944,
    15006918334.588783,
    15017243911.763641,
    null,
  ])
})

// Note how this only has three values, where the original data had four,
// because we've intentionally removed the first one
const composedUtilizationData = {
  chartData: [
    {
      timestamp: 1740166183000,
      value: 5002306111.529594,
    },
    {
      timestamp: 1740166243000,
      value: 5005747970.58788,
    },
    {
      timestamp: 1740166303000,
      value: null,
    },
  ],
  timeseriesCount: 1,
}

// As above, we've removed the first value from the original data
const utilizationChartData = [
  {
    timestamp: 1740166183000,
    value: 100.04612223059189,
  },
  {
    timestamp: 1740166243000,
    value: 100.11495941175761,
  },
  {
    timestamp: 1740166303000,
    value: null,
  },
]

// These are the exepcted values if the same data came back for a 4-vcpu instance
// As above, we've discarded the first value from the original data
const utilizationChartData4 = [
  {
    timestamp: 1740166183000,
    value: 25.011530557647973,
  },
  {
    timestamp: 1740166243000,
    value: 25.028739852939403,
  },
  {
    timestamp: 1740166303000,
    value: null,
  },
]

test('get utilization chart data and process it for chart display', () => {
  const composedData = composeOxqlData(utilizationQueryResult1)
  expect(composedData).toEqual(composedUtilizationData)
  const { data: chartData } = getUtilizationChartProps(composedUtilizationData.chartData, 1)
  expect(chartData).toEqual(utilizationChartData)
  // Testing the same data, but for a 4-vcpu instance
  const { data: chartData4 } = getUtilizationChartProps(
    composedUtilizationData.chartData,
    4
  )
  expect(chartData4).toEqual(utilizationChartData4)
})
