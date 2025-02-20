/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { render } from '@testing-library/react'
import { describe, expect, it, test } from 'vitest'

import {
  getLargestValue,
  getMeanWithinSeconds,
  getOrderOfMagnitude,
  getUnit,
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

test('getOrderOfMagnitude', () => {
  expect(getOrderOfMagnitude(5, 1000)).toEqual(0)
  expect(getOrderOfMagnitude(1000, 1000)).toEqual(1)
  expect(getOrderOfMagnitude(1001, 1000)).toEqual(1)
  expect(getOrderOfMagnitude(10 ** 6, 1000)).toEqual(2)
  expect(getOrderOfMagnitude(10 ** 6 + 1, 1000)).toEqual(2)
  expect(getOrderOfMagnitude(10 ** 9, 1000)).toEqual(3)
  expect(getOrderOfMagnitude(10 ** 9 + 1, 1000)).toEqual(3)

  // Bytes
  expect(getOrderOfMagnitude(5, 1024)).toEqual(0)
  // KiBs
  expect(getOrderOfMagnitude(1024, 1024)).toEqual(1)
  expect(getOrderOfMagnitude(1025, 1024)).toEqual(1)
  expect(getOrderOfMagnitude(2 ** 20 - 1, 1024)).toEqual(1)
  // MiBs
  expect(getOrderOfMagnitude(2 ** 20, 1024)).toEqual(2)
  expect(getOrderOfMagnitude(2 ** 20 + 1, 1024)).toEqual(2)
  expect(getOrderOfMagnitude(2 ** 30 - 1, 1024)).toEqual(2)
  // GiBs
  expect(getOrderOfMagnitude(2 ** 30, 1024)).toEqual(3)
  expect(getOrderOfMagnitude(2 ** 30 + 1, 1024)).toEqual(3)

  expect(getOrderOfMagnitude(0, 1000)).toEqual(0)
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
