/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { describe, expect, it } from 'vitest'
import { render } from 'vitest-browser-react'

import { HighlightedOxqlQuery } from './HighlightedOxqlQuery'

describe('HighlightedOxqlQuery indentation', () => {
  const startTime = new Date('2024-01-01T00:00:00Z')
  const endTime = new Date('2024-01-01T01:00:00Z')
  it('no filters', async () => {
    const pre = await render(
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

  it('with filters', async () => {
    const pre = await render(
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

  it('with groupby', async () => {
    const pre = await render(
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
