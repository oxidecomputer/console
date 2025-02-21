/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { render } from '@testing-library/react'
import { describe, expect, it, test } from 'vitest'

import type { OxqlQueryResult } from '~/api'

import {
  composeOxqlData,
  getLargestValue,
  getMaxExponent,
  getMeanWithinSeconds,
  getUnit,
  getUtilizationChartProps,
  HighlightedOxqlQuery,
  oxqlTimestamp,
  toOxqlStr,
  yAxisLabelForCountChart,
} from './OxqlMetric'

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

describe('toOxqlStr', () => {
  const startTime = new Date('2024-01-01T00:00:00Z')
  const endTime = new Date('2024-01-01T01:00:00Z')
  it('generates a query for disk metrics without extra filters', () => {
    const query = toOxqlStr({
      metricName: 'virtual_disk:bytes_read',
      startTime,
      endTime,
    })
    expect(query).toBe(
      'get virtual_disk:bytes_read | filter timestamp >= @2023-12-31T23:58:00.000 && timestamp < @2024-01-01T01:00:00.000 | align mean_within(60s)'
    )
  })

  it('generates a query for vm metrics with instanceId filter', () => {
    const query = toOxqlStr({
      metricName: 'virtual_machine:vcpu_usage',
      startTime,
      endTime,
      eqFilters: {
        instance_id: 'vm-123',
      },
    })
    expect(query).toBe(
      'get virtual_machine:vcpu_usage | filter timestamp >= @2023-12-31T23:58:00.000 && timestamp < @2024-01-01T01:00:00.000 && instance_id == "vm-123" | align mean_within(60s)'
    )
  })

  it('generates a query for network metrics with interfaceId filter', () => {
    const query = toOxqlStr({
      metricName: 'instance_network_interface:bytes_sent',
      startTime,
      endTime,
      eqFilters: {
        interface_id: 'eth0',
      },
    })
    expect(query).toBe(
      'get instance_network_interface:bytes_sent | filter timestamp >= @2023-12-31T23:58:00.000 && timestamp < @2024-01-01T01:00:00.000 && interface_id == "eth0" | align mean_within(60s)'
    )
  })

  it('generates a query with vcpu state filter', () => {
    const query = toOxqlStr({
      metricName: 'virtual_machine:vcpu_usage',
      startTime,
      endTime,
      eqFilters: {
        state: 'run',
      },
    })
    expect(query).toBe(
      'get virtual_machine:vcpu_usage | filter timestamp >= @2023-12-31T23:58:00.000 && timestamp < @2024-01-01T01:00:00.000 && state == "run" | align mean_within(60s)'
    )
  })

  it('generates a query with group by instanceId', () => {
    const query = toOxqlStr({
      metricName: 'virtual_disk:bytes_written',
      startTime,
      endTime,
      eqFilters: {
        instance_id: 'vm-123',
      },
      groupBy: { cols: ['instance_id'], op: 'sum' },
    })
    expect(query).toBe(
      'get virtual_disk:bytes_written | filter timestamp >= @2023-12-31T23:58:00.000 && timestamp < @2024-01-01T01:00:00.000 && instance_id == "vm-123" | align mean_within(60s) | group_by [instance_id], sum'
    )
  })

  it('generates a query with group by attachedInstanceId', () => {
    const query = toOxqlStr({
      metricName: 'virtual_disk:io_latency',
      startTime,
      endTime,
      eqFilters: {
        attached_instance_id: 'attached-1',
      },
      groupBy: { cols: ['attached_instance_id'], op: 'sum' },
    })
    expect(query).toBe(
      'get virtual_disk:io_latency | filter timestamp >= @2023-12-31T23:58:00.000 && timestamp < @2024-01-01T01:00:00.000 && attached_instance_id == "attached-1" | align mean_within(60s) | group_by [attached_instance_id], sum'
    )
  })

  it('handles missing optional parameters gracefully', () => {
    const query = toOxqlStr({
      metricName: 'virtual_disk:flushes',
      startTime,
      endTime,
    })
    expect(query).toBe(
      'get virtual_disk:flushes | filter timestamp >= @2023-12-31T23:58:00.000 && timestamp < @2024-01-01T01:00:00.000 | align mean_within(60s)'
    )
  })

  it('correctly handles a range of disk and network metrics', () => {
    const query = toOxqlStr({
      metricName: 'instance_network_interface:bytes_received',
      startTime,
      endTime,
      eqFilters: {
        interface_id: 'eth0',
      },
    })
    expect(query).toBe(
      'get instance_network_interface:bytes_received | filter timestamp >= @2023-12-31T23:58:00.000 && timestamp < @2024-01-01T01:00:00.000 && interface_id == "eth0" | align mean_within(60s)'
    )
  })

  it('leaves out filters that are present but with falsy values', () => {
    const query = toOxqlStr({
      metricName: 'virtual_machine:vcpu_usage',
      startTime,
      endTime,
      eqFilters: {
        state: undefined,
      },
    })
    expect(query).toBe(
      'get virtual_machine:vcpu_usage | filter timestamp >= @2023-12-31T23:58:00.000 && timestamp < @2024-01-01T01:00:00.000 | align mean_within(60s)'
    )
  })
})

describe('HighlightedOxqlQuery indentation', () => {
  const startTime = new Date('2024-01-01T00:00:00Z')
  const endTime = new Date('2024-01-01T01:00:00Z')
  it('no filters', () => {
    const pre = render(
      <HighlightedOxqlQuery
        metricName="virtual_machine:vcpu_usage"
        startTime={startTime}
        endTime={endTime}
      />
    )
    // we have to do the assert this way because toHaveTextContent did not preserve the newlines
    expect(pre.container.textContent).toMatchInlineSnapshot(`
      "get virtual_machine:vcpu_usage
        | filter timestamp >= @2023-12-31T23:58:00.000
            && timestamp < @2024-01-01T01:00:00.000
        | align mean_within(60s)"
    `)
  })

  it('with filters', () => {
    const pre = render(
      <HighlightedOxqlQuery
        metricName="virtual_machine:vcpu_usage"
        startTime={startTime}
        endTime={endTime}
        eqFilters={{
          instance_id: 'an-instance-id',
          vcpu_id: 'a-cpu-id',
        }}
      />
    )
    expect(pre.container.textContent).toMatchInlineSnapshot(`
      "get virtual_machine:vcpu_usage
        | filter timestamp >= @2023-12-31T23:58:00.000
            && timestamp < @2024-01-01T01:00:00.000
            && instance_id == "an-instance-id"
            && vcpu_id == "a-cpu-id"
        | align mean_within(60s)"
    `)
  })

  it('with groupby', () => {
    const pre = render(
      <HighlightedOxqlQuery
        metricName="virtual_machine:vcpu_usage"
        startTime={startTime}
        endTime={endTime}
        eqFilters={{ instance_id: 'an-instance-id' }}
        groupBy={{ cols: ['instance_id'], op: 'sum' }}
      />
    )
    expect(pre.container.textContent).toMatchInlineSnapshot(`
      "get virtual_machine:vcpu_usage
        | filter timestamp >= @2023-12-31T23:58:00.000
            && timestamp < @2024-01-01T01:00:00.000
            && instance_id == "an-instance-id"
        | align mean_within(60s)
        | group_by [instance_id], sum"
    `)
  })
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

test('getUnit', () => {
  expect(getUnit('CPU Utilization')).toEqual('%')
  expect(getUnit('Bytes Read')).toEqual('Bytes')
  expect(getUnit('Disk reads')).toEqual('Count')
  expect(getUnit('Anything else')).toEqual('Count')
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

// we need to add a test that passes data in to the utilization function and gets the right data out

const mockUtilizationQueryResult1: OxqlQueryResult = {
  tables: [
    {
      name: 'virtual_machine:vcpu_usage',
      timeseries: {
        '16671618930358432507': {
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
              new Date('2025-02-21T19:32:43Z'),
              new Date('2025-02-21T19:33:43Z'),
              new Date('2025-02-21T19:34:43Z'),
              new Date('2025-02-21T19:35:43Z'),
              new Date('2025-02-21T19:36:43Z'),
              new Date('2025-02-21T19:37:43Z'),
              new Date('2025-02-21T19:38:43Z'),
              new Date('2025-02-21T19:39:43Z'),
              new Date('2025-02-21T19:40:43Z'),
              new Date('2025-02-21T19:41:43Z'),
              new Date('2025-02-21T19:42:43Z'),
              new Date('2025-02-21T19:43:43Z'),
              new Date('2025-02-21T19:44:43Z'),
              new Date('2025-02-21T19:45:43Z'),
              new Date('2025-02-21T19:46:43Z'),
              new Date('2025-02-21T19:47:43Z'),
              new Date('2025-02-21T19:48:43Z'),
              new Date('2025-02-21T19:49:43Z'),
              new Date('2025-02-21T19:50:43Z'),
              new Date('2025-02-21T19:51:43Z'),
              new Date('2025-02-21T19:52:43Z'),
              new Date('2025-02-21T19:53:43Z'),
              new Date('2025-02-21T19:54:43Z'),
              new Date('2025-02-21T19:55:43Z'),
              new Date('2025-02-21T19:56:43Z'),
              new Date('2025-02-21T19:57:43Z'),
              new Date('2025-02-21T19:58:43Z'),
              new Date('2025-02-21T19:59:43Z'),
              new Date('2025-02-21T20:00:43Z'),
              new Date('2025-02-21T20:01:43Z'),
              new Date('2025-02-21T20:02:43Z'),
              new Date('2025-02-21T20:03:43Z'),
              new Date('2025-02-21T20:04:43Z'),
              new Date('2025-02-21T20:05:43Z'),
              new Date('2025-02-21T20:06:43Z'),
              new Date('2025-02-21T20:07:43Z'),
              new Date('2025-02-21T20:08:43Z'),
              new Date('2025-02-21T20:09:43Z'),
              new Date('2025-02-21T20:10:43Z'),
              new Date('2025-02-21T20:11:43Z'),
              new Date('2025-02-21T20:12:43Z'),
              new Date('2025-02-21T20:13:43Z'),
              new Date('2025-02-21T20:14:43Z'),
              new Date('2025-02-21T20:15:43Z'),
              new Date('2025-02-21T20:16:43Z'),
              new Date('2025-02-21T20:17:43Z'),
              new Date('2025-02-21T20:18:43Z'),
              new Date('2025-02-21T20:19:43Z'),
              new Date('2025-02-21T20:20:43Z'),
              new Date('2025-02-21T20:21:43Z'),
              new Date('2025-02-21T20:22:43Z'),
              new Date('2025-02-21T20:23:43Z'),
              new Date('2025-02-21T20:24:43Z'),
              new Date('2025-02-21T20:25:43Z'),
              new Date('2025-02-21T20:26:43Z'),
              new Date('2025-02-21T20:27:43Z'),
              new Date('2025-02-21T20:28:43Z'),
              new Date('2025-02-21T20:29:43Z'),
            ],
            values: [
              {
                values: {
                  type: 'double',
                  values: [
                    4991154550.953981, 5002306111.529594, 5005747970.58788,
                    4996292893.584528, 4998050968.850756, 5004789144.090651,
                    4993214810.150828, 5000464185.201564, 5001669934.944093,
                    5001497083.202703, 5001011172.672396, 4992008144.654252,
                    5001831380.890524, 5001924806.276582, 5000916037.925857,
                    5002960670.484395, 4996184711.242969, 5000408631.826216,
                    5001631112.771454, 4998643337.888756, 4997817860.921065,
                    4996502887.860745, 4999178998.162529, 4994865192.767912,
                    5005724862.797634, 4999589122.343746, 5007221017.048959,
                    4996445205.790302, 5000366399.336565, 4999095693.988176,
                    4996619332.9898, 4993659092.807705, 5009543189.323464,
                    4994787455.051904, 4993292628.398588, 5009871829.741958,
                    5002778061.339198, 4999817422.413484, 4994998220.218649,
                    4997729058.293921, 5004827623.343801, 4995786421.375828,
                    5002188834.540807, 5000390248.439431, 4994598636.529923,
                    4993232474.252971, 5015096657.077068, 4995845911.9815035,
                    5002761273.34156, 4995737637.523023, 4991925780.139541,
                    5010169320.08084, 4993772659.0981, 5005649892.409724, 5452769628.274348,
                    4994355347.268937, 5005185973.638839, 5001042443.806114,
                    4995978113.541379, 4996046489.761501, 5004127086.180883,
                    4615078611.35084,
                  ],
                },
                metricType: 'gauge',
              },
            ],
          },
        },
      },
    },
  ],
}

const mockComposedUtilizationData1 = {
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
      value: 4996292893.584528,
    },
    {
      timestamp: 1740166363000,
      value: 4998050968.850756,
    },
    {
      timestamp: 1740166423000,
      value: 5004789144.090651,
    },
    {
      timestamp: 1740166483000,
      value: 4993214810.150828,
    },
    {
      timestamp: 1740166543000,
      value: 5000464185.201564,
    },
    {
      timestamp: 1740166603000,
      value: 5001669934.944093,
    },
    {
      timestamp: 1740166663000,
      value: 5001497083.202703,
    },
    {
      timestamp: 1740166723000,
      value: 5001011172.672396,
    },
    {
      timestamp: 1740166783000,
      value: 4992008144.654252,
    },
    {
      timestamp: 1740166843000,
      value: 5001831380.890524,
    },
    {
      timestamp: 1740166903000,
      value: 5001924806.276582,
    },
    {
      timestamp: 1740166963000,
      value: 5000916037.925857,
    },
    {
      timestamp: 1740167023000,
      value: 5002960670.484395,
    },
    {
      timestamp: 1740167083000,
      value: 4996184711.242969,
    },
    {
      timestamp: 1740167143000,
      value: 5000408631.826216,
    },
    {
      timestamp: 1740167203000,
      value: 5001631112.771454,
    },
    {
      timestamp: 1740167263000,
      value: 4998643337.888756,
    },
    {
      timestamp: 1740167323000,
      value: 4997817860.921065,
    },
    {
      timestamp: 1740167383000,
      value: 4996502887.860745,
    },
    {
      timestamp: 1740167443000,
      value: 4999178998.162529,
    },
    {
      timestamp: 1740167503000,
      value: 4994865192.767912,
    },
    {
      timestamp: 1740167563000,
      value: 5005724862.797634,
    },
    {
      timestamp: 1740167623000,
      value: 4999589122.343746,
    },
    {
      timestamp: 1740167683000,
      value: 5007221017.048959,
    },
    {
      timestamp: 1740167743000,
      value: 4996445205.790302,
    },
    {
      timestamp: 1740167803000,
      value: 5000366399.336565,
    },
    {
      timestamp: 1740167863000,
      value: 4999095693.988176,
    },
    {
      timestamp: 1740167923000,
      value: 4996619332.9898,
    },
    {
      timestamp: 1740167983000,
      value: 4993659092.807705,
    },
    {
      timestamp: 1740168043000,
      value: 5009543189.323464,
    },
    {
      timestamp: 1740168103000,
      value: 4994787455.051904,
    },
    {
      timestamp: 1740168163000,
      value: 4993292628.398588,
    },
    {
      timestamp: 1740168223000,
      value: 5009871829.741958,
    },
    {
      timestamp: 1740168283000,
      value: 5002778061.339198,
    },
    {
      timestamp: 1740168343000,
      value: 4999817422.413484,
    },
    {
      timestamp: 1740168403000,
      value: 4994998220.218649,
    },
    {
      timestamp: 1740168463000,
      value: 4997729058.293921,
    },
    {
      timestamp: 1740168523000,
      value: 5004827623.343801,
    },
    {
      timestamp: 1740168583000,
      value: 4995786421.375828,
    },
    {
      timestamp: 1740168643000,
      value: 5002188834.540807,
    },
    {
      timestamp: 1740168703000,
      value: 5000390248.439431,
    },
    {
      timestamp: 1740168763000,
      value: 4994598636.529923,
    },
    {
      timestamp: 1740168823000,
      value: 4993232474.252971,
    },
    {
      timestamp: 1740168883000,
      value: 5015096657.077068,
    },
    {
      timestamp: 1740168943000,
      value: 4995845911.9815035,
    },
    {
      timestamp: 1740169003000,
      value: 5002761273.34156,
    },
    {
      timestamp: 1740169063000,
      value: 4995737637.523023,
    },
    {
      timestamp: 1740169123000,
      value: 4991925780.139541,
    },
    {
      timestamp: 1740169183000,
      value: 5010169320.08084,
    },
    {
      timestamp: 1740169243000,
      value: 4993772659.0981,
    },
    {
      timestamp: 1740169303000,
      value: 5005649892.409724,
    },
    {
      timestamp: 1740169363000,
      value: 5452769628.274348,
    },
    {
      timestamp: 1740169423000,
      value: 4994355347.268937,
    },
    {
      timestamp: 1740169483000,
      value: 5005185973.638839,
    },
    {
      timestamp: 1740169543000,
      value: 5001042443.806114,
    },
    {
      timestamp: 1740169603000,
      value: 4995978113.541379,
    },
    {
      timestamp: 1740169663000,
      value: 4996046489.761501,
    },
    {
      timestamp: 1740169723000,
      value: 5004127086.180883,
    },
    {
      timestamp: 1740169783000,
      value: 4615078611.35084,
    },
  ],
  timeseriesCount: 1,
}

const mockUtilizationChartData1 = [
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
    value: 99.92585787169057,
  },
  {
    timestamp: 1740166363000,
    value: 99.9610193770151,
  },
  {
    timestamp: 1740166423000,
    value: 100.09578288181301,
  },
  {
    timestamp: 1740166483000,
    value: 99.86429620301656,
  },
  {
    timestamp: 1740166543000,
    value: 100.00928370403128,
  },
  {
    timestamp: 1740166603000,
    value: 100.03339869888185,
  },
  {
    timestamp: 1740166663000,
    value: 100.02994166405406,
  },
  {
    timestamp: 1740166723000,
    value: 100.02022345344791,
  },
  {
    timestamp: 1740166783000,
    value: 99.84016289308505,
  },
  {
    timestamp: 1740166843000,
    value: 100.03662761781047,
  },
  {
    timestamp: 1740166903000,
    value: 100.03849612553164,
  },
  {
    timestamp: 1740166963000,
    value: 100.01832075851712,
  },
  {
    timestamp: 1740167023000,
    value: 100.0592134096879,
  },
  {
    timestamp: 1740167083000,
    value: 99.92369422485937,
  },
  {
    timestamp: 1740167143000,
    value: 100.00817263652432,
  },
  {
    timestamp: 1740167203000,
    value: 100.03262225542908,
  },
  {
    timestamp: 1740167263000,
    value: 99.97286675777512,
  },
  {
    timestamp: 1740167323000,
    value: 99.9563572184213,
  },
  {
    timestamp: 1740167383000,
    value: 99.93005775721491,
  },
  {
    timestamp: 1740167443000,
    value: 99.98357996325059,
  },
  {
    timestamp: 1740167503000,
    value: 99.89730385535825,
  },
  {
    timestamp: 1740167563000,
    value: 100.11449725595268,
  },
  {
    timestamp: 1740167623000,
    value: 99.99178244687492,
  },
  {
    timestamp: 1740167683000,
    value: 100.14442034097918,
  },
  {
    timestamp: 1740167743000,
    value: 99.92890411580605,
  },
  {
    timestamp: 1740167803000,
    value: 100.0073279867313,
  },
  {
    timestamp: 1740167863000,
    value: 99.98191387976352,
  },
  {
    timestamp: 1740167923000,
    value: 99.93238665979601,
  },
  {
    timestamp: 1740167983000,
    value: 99.8731818561541,
  },
  {
    timestamp: 1740168043000,
    value: 100.1908637864693,
  },
  {
    timestamp: 1740168103000,
    value: 99.89574910103808,
  },
  {
    timestamp: 1740168163000,
    value: 99.86585256797177,
  },
  {
    timestamp: 1740168223000,
    value: 100.19743659483915,
  },
  {
    timestamp: 1740168283000,
    value: 100.05556122678396,
  },
  {
    timestamp: 1740168343000,
    value: 99.99634844826967,
  },
  {
    timestamp: 1740168403000,
    value: 99.89996440437298,
  },
  {
    timestamp: 1740168463000,
    value: 99.95458116587842,
  },
  {
    timestamp: 1740168523000,
    value: 100.09655246687602,
  },
  {
    timestamp: 1740168583000,
    value: 99.91572842751656,
  },
  {
    timestamp: 1740168643000,
    value: 100.04377669081613,
  },
  {
    timestamp: 1740168703000,
    value: 100.00780496878862,
  },
  {
    timestamp: 1740168763000,
    value: 99.89197273059847,
  },
  {
    timestamp: 1740168823000,
    value: 99.86464948505942,
  },
  {
    timestamp: 1740168883000,
    value: 100.30193314154137,
  },
  {
    timestamp: 1740168943000,
    value: 99.91691823963006,
  },
  {
    timestamp: 1740169003000,
    value: 100.0552254668312,
  },
  {
    timestamp: 1740169063000,
    value: 99.91475275046045,
  },
  {
    timestamp: 1740169123000,
    value: 99.8385156027908,
  },
  {
    timestamp: 1740169183000,
    value: 100.2033864016168,
  },
  {
    timestamp: 1740169243000,
    value: 99.875453181962,
  },
  {
    timestamp: 1740169303000,
    value: 100.11299784819448,
  },
  {
    timestamp: 1740169363000,
    value: 109.05539256548697,
  },
  {
    timestamp: 1740169423000,
    value: 99.88710694537875,
  },
  {
    timestamp: 1740169483000,
    value: 100.10371947277677,
  },
  {
    timestamp: 1740169543000,
    value: 100.02084887612229,
  },
  {
    timestamp: 1740169603000,
    value: 99.91956227082757,
  },
  {
    timestamp: 1740169663000,
    value: 99.92092979523002,
  },
  {
    timestamp: 1740169723000,
    value: 100.08254172361767,
  },
  {
    timestamp: 1740169783000,
    value: 92.30157222701679,
  },
]

test('get utilization chart data and process it for chart display', () => {
  const composedData = composeOxqlData(mockUtilizationQueryResult1)
  expect(composedData).toEqual(mockComposedUtilizationData1)
  const { data: chartData } = getUtilizationChartProps(
    mockComposedUtilizationData1.chartData,
    1
  )
  expect(chartData).toEqual(mockUtilizationChartData1)
})
