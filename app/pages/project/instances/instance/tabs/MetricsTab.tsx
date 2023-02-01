import { Suspense, useMemo, useState } from 'react'
import React from 'react'
import type { LoaderFunctionArgs } from 'react-router-dom'
import invariant from 'tiny-invariant'

import type { Cumulativeint64, DiskMetricName } from '@oxide/api'
import { apiQueryClient } from '@oxide/api'
import { useApiQuery } from '@oxide/api'
import { Listbox, Spinner } from '@oxide/ui'

import { useDateTimeRangePicker } from 'app/components/form'
import { requireInstanceParams, useRequiredParams } from 'app/hooks'

const TimeSeriesChart = React.lazy(() => import('app/components/TimeSeriesChart'))

type DiskMetricParams = {
  title: string
  unit?: string
  startTime: Date
  endTime: Date
  metricName: DiskMetricName
  diskParams: { orgName: string; projectName: string; diskName: string }
}

function DiskMetric({
  title,
  unit,
  startTime,
  endTime,
  metricName,
  diskParams,
}: DiskMetricParams) {
  // TODO: we're only pulling the first page. Should we bump the cap to 10k?
  // Fetch multiple pages if 10k is not enough? That's a bit much.
  const { data: metrics, isLoading } = useApiQuery(
    'diskMetricsList',
    {
      path: { ...diskParams, metricName },
      query: { startTime, endTime, limit: 1000 },
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
      <h2 className="ml-3 flex items-center text-mono-md text-secondary">
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
  await apiQueryClient.prefetchQuery('instanceDiskList', {
    path: requireInstanceParams(params),
  })
  return null
}

export function MetricsTab() {
  const instanceParams = useRequiredParams('orgName', 'projectName', 'instanceName')
  const { data } = useApiQuery('instanceDiskList', { path: instanceParams })
  const disks = useMemo(() => data?.items || [], [data])

  // because of prefetch in the loader and because an instance should always
  // have a disk, we should never see an empty list here
  invariant(disks.length > 0, 'Instance disks list should never be empty')

  const { orgName, projectName } = useRequiredParams('orgName', 'projectName')

  const { startTime, endTime, dateTimeRangePicker } = useDateTimeRangePicker('lastDay')

  const [diskName, setDiskName] = useState<string>(disks[0].name)
  const diskItems = disks.map(({ name }) => ({ label: name, value: name }))

  const diskParams = { orgName, projectName, diskName }
  const commonProps = { startTime, endTime, diskParams }

  return (
    <>
      <h2 className="text-sans-xl">Disk metrics</h2>
      <div className="mb-4 flex justify-between">
        <Listbox
          className="w-48"
          aria-label="Choose disk"
          name="disk-name"
          items={diskItems}
          onChange={(item) => {
            if (item) {
              setDiskName(item.value)
            }
          }}
          defaultValue={diskName}
        />
        {dateTimeRangePicker}
      </div>

      <div className="mt-8 space-y-12">
        {/* see the following link for the source of truth on what these mean
            https://github.com/oxidecomputer/crucible/blob/258f162b/upstairs/src/stats.rs#L9-L50 */}
        <div className="flex w-full space-x-4">
          <DiskMetric {...commonProps} title="Reads" unit="(Count)" metricName="read" />
          <DiskMetric
            {...commonProps}
            title="Read"
            unit="(Bytes)"
            metricName="read_bytes"
          />
        </div>

        <div className="flex w-full space-x-4">
          <DiskMetric {...commonProps} title="Writes" unit="(Count)" metricName="write" />
          <DiskMetric
            {...commonProps}
            title="Write"
            unit="(Bytes)"
            metricName="write_bytes"
          />
        </div>

        <div className="flex w-full space-x-4">
          <DiskMetric {...commonProps} title="Flushes" unit="(Count)" metricName="flush" />
        </div>
      </div>
    </>
  )
}
