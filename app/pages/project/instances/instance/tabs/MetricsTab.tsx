/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import React, { Suspense, useMemo, useState } from 'react'
import type { LoaderFunctionArgs } from 'react-router-dom'

import type { Cumulativeint64, DiskMetricName } from '@oxide/api'
import { apiQueryClient, useApiQuery } from '@oxide/api'
import { EmptyMessage, Listbox, Spinner, Storage24Icon, TableEmptyBox } from '@oxide/ui'

import { useDateTimeRangePicker } from 'app/components/form'
import { getInstanceSelector, useInstanceSelector } from 'app/hooks'

const TimeSeriesChart = React.lazy(() => import('app/components/TimeSeriesChart'))

type DiskMetricParams = {
  title: string
  unit?: string
  startTime: Date
  endTime: Date
  metric: DiskMetricName
  diskSelector: {
    project: string
    disk: string
  }
}

function DiskMetric({
  title,
  unit,
  startTime,
  endTime,
  metric,
  diskSelector: { project, disk },
}: DiskMetricParams) {
  // TODO: we're only pulling the first page. Should we bump the cap to 10k?
  // Fetch multiple pages if 10k is not enough? That's a bit much.
  const { data: metrics, isLoading } = useApiQuery(
    'diskMetricsList',
    {
      path: { disk, metric },
      query: { project, startTime, endTime, limit: 3000 },
    },
    // avoid graphs flashing blank while loading when you change the time
    { keepPreviousData: true }
  )

  const data = (metrics?.items || []).map(({ datum, timestamp }) => ({
    timestamp: timestamp.getTime(),
    // all of these metrics are cumulative ints
    value: (datum.datum as Cumulativeint64).value,
  }))

  return (
    <div className="flex w-1/2 flex-grow flex-col">
      <h2 className="ml-3 flex items-center text-mono-xs text-secondary">
        {title} {unit && <div className="ml-1 text-quaternary">{unit}</div>}
        {isLoading && <Spinner className="ml-2" />}
      </h2>
      <Suspense fallback={<div className="mt-3 h-[300px]" />}>
        <TimeSeriesChart
          className="mt-3"
          data={data}
          title={title}
          width={480}
          height={240}
          startTime={startTime}
          endTime={endTime}
        />
      </Suspense>
    </div>
  )
}

// We could figure out how to prefetch the metrics data, but it would be
// annoying because it relies on the default date range, plus there are 5 calls.
// Considering the data is going to be swapped out as soon as they change the
// date range, I'm inclined to punt.

MetricsTab.loader = async ({ params }: LoaderFunctionArgs) => {
  const { project, instance } = getInstanceSelector(params)
  await apiQueryClient.prefetchQuery('instanceDiskList', {
    path: { instance },
    query: { project },
  })
  return null
}

export function MetricsTab() {
  const { project, instance } = useInstanceSelector()
  const { data } = useApiQuery('instanceDiskList', {
    path: { instance },
    query: { project },
  })
  const disks = useMemo(() => data?.items || [], [data])

  const { startTime, endTime, dateTimeRangePicker } = useDateTimeRangePicker({
    initialPreset: 'lastDay',
  })

  // The fallback here is kind of silly — it is only invoked when there are no
  // disks, in which case we show the fallback UI and diskName is never used. We
  // only need to do it this way because hooks cannot be called conditionally.
  const [diskName, setDiskName] = useState<string>(disks[0]?.name || '')
  const diskItems = disks.map(({ name }) => ({ label: name, value: name }))

  if (disks.length === 0) {
    return (
      <TableEmptyBox>
        <EmptyMessage
          icon={<Storage24Icon />}
          title="No metrics available"
          body="Metrics are only available if there are disks attached"
        />
      </TableEmptyBox>
    )
  }

  const commonProps = {
    startTime,
    endTime,
    diskSelector: { project, disk: diskName },
  }

  return (
    <>
      <div className="mb-4 flex justify-between">
        <Listbox
          className="w-48"
          aria-label="Choose disk"
          name="disk-name"
          selected={diskName}
          items={diskItems}
          onChange={(val) => {
            val && setDiskName(val)
          }}
        />
        {dateTimeRangePicker}
      </div>

      <div className="mt-8 space-y-12">
        {/* see the following link for the source of truth on what these mean
            https://github.com/oxidecomputer/crucible/blob/258f162b/upstairs/src/stats.rs#L9-L50 */}
        <div className="flex w-full space-x-4">
          <DiskMetric {...commonProps} title="Reads" unit="(Count)" metric="read" />
          <DiskMetric {...commonProps} title="Read" unit="(Bytes)" metric="read_bytes" />
        </div>

        <div className="flex w-full space-x-4">
          <DiskMetric {...commonProps} title="Writes" unit="(Count)" metric="write" />
          <DiskMetric {...commonProps} title="Write" unit="(Bytes)" metric="write_bytes" />
        </div>

        <div className="flex w-full space-x-4">
          <DiskMetric {...commonProps} title="Flushes" unit="(Count)" metric="flush" />
        </div>
      </div>
    </>
  )
}
