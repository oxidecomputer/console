/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useMemo } from 'react'

import { useApiQuery, type SystemMetricName } from '@oxide/api'
import { splitDecimal } from '@oxide/util'

// exported to use in the loader because it needs to be identical
export const capacityQueryParams = {
  // beginning of time, aka 1970
  startTime: new Date(0),
  // kind of janky to use pageload time. we can think about making it live
  // later. ideally refetch would be coordinated with the graphs
  endTime: new Date(),
  limit: 1,
  order: 'descending' as const,
}

export const CapacityBar = ({
  icon,
  title,
  unit,
  metricName,
  valueTransform = (x) => x,
  provisioned,
  capacity,
  quota,
}: {
  icon: JSX.Element
  title: 'CPU' | 'Disk' | 'Memory'
  unit: 'nCPUs' | 'GiB' | 'TiB'
  metricName: SystemMetricName
  valueTransform?: (n: number) => number
  provisioned: number
  capacity: number
  quota: number
}) => {
  // this is going to return at most one data point
  const { data } = useApiQuery(
    'systemMetric',
    { path: { metricName }, query: capacityQueryParams },
    { placeholderData: (x) => x }
  )

  const metrics = useMemo(() => data?.items || [], [data])
  const datum = metrics && metrics.length > 0 ? metrics[metrics.length - 1].datum.datum : 0
  // it's always a number but let's rule out the other options without doing a cast
  const utilization = valueTransform(typeof datum === 'number' ? datum : 0)
  const utilizationPct = (100 * utilization) / capacity
  const [wholeNumber, decimal] = splitDecimal(utilizationPct)

  const provisionedPercent = `${(100 * provisioned) / capacity}%`
  const quotaAvailablePercent = `${(100 * (quota - provisioned)) / capacity}%`

  const UtilizationDatum = ({
    name,
    amount,
  }: {
    name: 'Provisioned' | 'Quota' | 'Capacity'
    amount: number
  }) => (
    <div className="p-3 text-mono-sm">
      <div className="text-quaternary">{name}</div>
      <div className="text-secondary">{amount}</div>
    </div>
  )

  return (
    <div className="w-full min-w-min rounded-lg border border-default">
      <div className="flex p-3">
        {/* the icon, title, and hero datum */}
        <div className="mr-1 flex h-6 w-6 items-start justify-center text-accent">
          {icon}
        </div>
        <div className="flex flex-grow items-start">
          <span className="text-mono-sm text-secondary">{title}</span>
          <span className="ml-1 text-mono-sm text-quaternary">({unit})</span>
        </div>
        <div className="flex items-baseline [font-size:36px] [line-height:1]">
          <div className="font-light">{wholeNumber.toLocaleString()}</div>
          <div className="text-quaternary [font-size:18px]">{decimal || ''}%</div>
        </div>
      </div>
      <div className="p-3 pt-1">
        {/* the bar */}
        <div className="flex w-full gap-0.5">
          <div
            className="h-3 rounded-l border bg-accent-secondary border-accent-secondary"
            style={{ width: provisionedPercent }}
          ></div>
          <div
            className="h-3 border bg-info-secondary border-info-secondary"
            style={{ width: quotaAvailablePercent }}
          ></div>
          <div className="bg-surface-secondary h-3 grow rounded-r border border-default"></div>
        </div>
      </div>
      <div>
        {/* the more detailed data */}
        <div className="flex justify-between border-t border-secondary">
          <UtilizationDatum name="Provisioned" amount={provisioned} />
          <UtilizationDatum name="Quota" amount={quota} />
          <UtilizationDatum name="Capacity" amount={capacity} />
        </div>
      </div>
    </div>
  )
}
