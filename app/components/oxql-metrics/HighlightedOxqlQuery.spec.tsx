/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { HighlightedOxqlQuery, toOxqlStr } from './HighlightedOxqlQuery'

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
