import { getLocalTimeZone } from '@internationalized/date'
import React, { Suspense, useMemo, useState } from 'react'
import type { LoaderFunctionArgs } from 'react-router-dom'
import invariant from 'tiny-invariant'

import type { Cumulativeint64, DiskMetricName } from '@oxide/api'
import { apiQueryClient, useApiQuery } from '@oxide/api'
import { Listbox, Spinner } from '@oxide/ui'
import { toPathQuery } from '@oxide/util'

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
      query: { project, startTime, endTime, limit: 1000 },
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
  await apiQueryClient.prefetchQuery(
    'instanceDiskList',
    toPathQuery('instance', getInstanceSelector(params))
  )
  return null
}

export function MetricsTab() {
  const instanceSelector = useInstanceSelector()
  const { project } = instanceSelector
  const { data } = useApiQuery(
    'instanceDiskList',
    toPathQuery('instance', instanceSelector)
  )
  const disks = useMemo(() => data?.items || [], [data])

  // because of prefetch in the loader and because an instance should always
  // have a disk, we should never see an empty list here
  invariant(disks.length > 0, 'Instance disks list should never be empty')

  const { startTime, endTime, dateTimeRangePicker } = useDateTimeRangePicker({
    initialPreset: 'lastDay',
  })

  const [diskName, setDiskName] = useState<string>(disks[0].name)
  const diskItems = disks.map(({ name }) => ({ label: name, value: name }))

  const commonProps = {
    startTime: startTime.toDate(getLocalTimeZone()),
    endTime: endTime.toDate(getLocalTimeZone()),
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
